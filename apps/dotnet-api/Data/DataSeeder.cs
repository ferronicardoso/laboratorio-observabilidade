using dotnet_api.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnet_api.Data;

public static class DataSeeder
{
    private static readonly string[] Categories = new[]
    {
        "Notebooks", "Periféricos", "Monitores", "Componentes", "Áudio",
        "Rede", "Armazenamento", "Smartphones", "Tablets", "Câmeras"
    };

    private static readonly string[] Brands = new[]
    {
        "Dell", "HP", "Lenovo", "Apple", "Samsung", "LG", "Logitech",
        "Razer", "Corsair", "Kingston", "Seagate", "Western Digital",
        "Sony", "Canon", "Nikon", "Asus", "Acer", "MSI"
    };

    private static readonly string[] Adjectives = new[]
    {
        "Premium", "Pro", "Ultra", "Plus", "Max", "Elite", "Gaming",
        "Business", "Home", "Studio", "Wireless", "Compact", "Portable"
    };

    public static async Task SeedData(AppDbContext context, ILogger logger)
    {
        // Verificar se já existem produtos
        if (await context.Products.AnyAsync())
        {
            logger.LogInformation("Banco de dados já contém produtos. Pulando seed.");
            return;
        }

        logger.LogInformation("Iniciando seed do banco de dados com 1000 produtos...");

        var random = new Random(42); // Seed fixo para reproduzibilidade
        var products = new List<Product>();

        for (int i = 1; i <= 1000; i++)
        {
            var category = Categories[random.Next(Categories.Length)];
            var brand = Brands[random.Next(Brands.Length)];
            var adjective = Adjectives[random.Next(Adjectives.Length)];

            var product = new Product
            {
                Id = i,
                Name = $"{brand} {adjective} {category} {i}",
                Description = GenerateDescription(brand, category, adjective, random),
                Price = GeneratePrice(category, random),
                Stock = random.Next(0, 100),
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 365))
            };

            products.Add(product);
        }

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        logger.LogInformation("Seed concluído! {Count} produtos criados.", products.Count);
    }

    private static string GenerateDescription(string brand, string category, string adjective, Random random)
    {
        var descriptions = new[]
        {
            $"{adjective} {category} da {brand} com tecnologia de ponta",
            $"Produto {adjective} ideal para profissionais e entusiastas",
            $"{brand} {category} com excelente custo-benefício",
            $"Nova linha {adjective} da {brand} com garantia estendida",
            $"{category} de alta performance da {brand}",
            $"Edição {adjective} com recursos exclusivos",
            $"{brand} {category} - líder de mercado em qualidade"
        };

        return descriptions[random.Next(descriptions.Length)];
    }

    private static decimal GeneratePrice(string category, Random random)
    {
        // Prices baseados na categoria
        var priceRanges = new Dictionary<string, (int min, int max)>
        {
            { "Notebooks", (2000, 10000) },
            { "Smartphones", (800, 8000) },
            { "Monitores", (500, 5000) },
            { "Periféricos", (50, 1500) },
            { "Componentes", (100, 4000) },
            { "Áudio", (100, 3000) },
            { "Rede", (50, 2000) },
            { "Armazenamento", (200, 3000) },
            { "Tablets", (500, 5000) },
            { "Câmeras", (1000, 15000) }
        };

        if (priceRanges.TryGetValue(category, out var range))
        {
            return random.Next(range.min, range.max) + (decimal)(random.NextDouble() * 0.99);
        }

        return random.Next(100, 5000) + (decimal)(random.NextDouble() * 0.99);
    }
}
