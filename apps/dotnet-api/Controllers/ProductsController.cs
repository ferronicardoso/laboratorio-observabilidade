using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using dotnet_api.Models;
using System.Diagnostics.Metrics;

namespace dotnet_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly Counter<long> _productsCreatedCounter;
    private readonly Counter<long> _productsQueriedCounter;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        AppDbContext context,
        IMeterFactory meterFactory,
        ILogger<ProductsController> logger)
    {
        _context = context;
        _logger = logger;

        var meter = meterFactory.Create("Products.API");
        _productsCreatedCounter = meter.CreateCounter<long>("products_created_total",
            description: "Total de produtos criados");
        _productsQueriedCounter = meter.CreateCounter<long>("products_queried_total",
            description: "Total de queries de produtos");
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        _logger.LogInformation("Buscando produtos - Página {Page}, Tamanho {PageSize}", page, pageSize);

        var products = await _context.Products
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        _productsQueriedCounter.Add(products.Count);

        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        _logger.LogInformation("Buscando produto com ID {ProductId}", id);

        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            _logger.LogWarning("Produto com ID {ProductId} não encontrado", id);
            return NotFound(new { message = $"Produto com ID {id} não encontrado" });
        }

        _productsQueriedCounter.Add(1);
        return Ok(product);
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _logger.LogInformation("Criando novo produto: {ProductName}", product.Name);

        product.CreatedAt = DateTime.UtcNow;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        _productsCreatedCounter.Add(1);

        _logger.LogInformation("Produto criado com ID {ProductId}", product.Id);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    // PUT: api/products/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id)
        {
            return BadRequest(new { message = "ID do produto não corresponde" });
        }

        _logger.LogInformation("Atualizando produto com ID {ProductId}", id);

        product.UpdatedAt = DateTime.UtcNow;
        _context.Entry(product).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Produto com ID {ProductId} atualizado com sucesso", id);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ProductExists(id))
            {
                _logger.LogWarning("Produto com ID {ProductId} não encontrado para atualização", id);
                return NotFound(new { message = $"Produto com ID {id} não encontrado" });
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/products/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        _logger.LogInformation("Deletando produto com ID {ProductId}", id);

        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            _logger.LogWarning("Produto com ID {ProductId} não encontrado para deletar", id);
            return NotFound(new { message = $"Produto com ID {id} não encontrado" });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Produto com ID {ProductId} deletado com sucesso", id);
        return NoContent();
    }

    // GET: api/products/count
    [HttpGet("count")]
    public async Task<ActionResult<int>> GetProductsCount()
    {
        var count = await _context.Products.CountAsync();
        _logger.LogInformation("Total de produtos: {Count}", count);
        return Ok(new { count });
    }

    private async Task<bool> ProductExists(int id)
    {
        return await _context.Products.AnyAsync(e => e.Id == id);
    }
}
