from django.core.management.base import BaseCommand

from catalog.models import Category, Product


class Command(BaseCommand):
    help = 'Seed official Rajan Dairy categories and products.'

    def handle(self, *args, **options):
        data = {
            'Milk': {
                'description': 'Fresh and nutritious daily milk options.',
                'products': [
                    ('Cow Milk', 'Pure cow milk', 60.00),
                    ('Buffalo Milk', 'Rich buffalo milk', 70.00),
                    ('Toned Milk', 'Balanced fat toned milk', 55.00),
                    ('Full Cream Milk', 'Creamy full fat milk', 68.00),
                ],
            },
            'Fresh Dairy': {
                'description': 'Freshly prepared dairy essentials.',
                'products': [
                    ('Curd (Dahi)', 'Farm-fresh curd', 45.00),
                    ('Buttermilk (Chaas)', 'Refreshing chaas', 30.00),
                    ('Lassi (Sweet)', 'Sweet lassi', 40.00),
                    ('Lassi (Salted)', 'Salted lassi', 40.00),
                    ('Paneer', 'Soft paneer block', 95.00),
                    ('Butter', 'Creamy table butter', 80.00),
                    ('Ghee', 'Traditional cow ghee', 250.00),
                ],
            },
            'Sweets & Traditional': {
                'description': 'Traditional sweets and festive dairy treats.',
                'products': [
                    ('Shrikhand', 'Classic saffron shrikhand', 90.00),
                    ('Amrakhand', 'Mango flavored amrakhand', 100.00),
                    ('Pedha', 'Milky pedha sweets', 120.00),
                    ('Gulab Jamun', 'Soft gulab jamun', 110.00),
                    ('Barfi', 'Traditional milk barfi', 130.00),
                    ('Khoa', 'Pure khoa base', 140.00),
                ],
            },
            'Cheese & Value Added': {
                'description': 'Cheese and value-added dairy products.',
                'products': [
                    ('Cheddar Cheese', 'Mature cheddar block', 180.00),
                    ('Processed Cheese', 'Processed cheese slices', 160.00),
                    ('Mozzarella Cheese', 'Shredded mozzarella', 190.00),
                    ('Whey Cheese', 'Protein-rich whey cheese', 170.00),
                    ('Flavoured Milk', 'Assorted flavored milk', 35.00),
                ],
            },
            'Beverages': {
                'description': 'Refreshing beverages and packaged water.',
                'products': [
                    ('Mango Drink', 'Mango fruit beverage', 25.00),
                    ('Orange Drink', 'Orange fruit beverage', 25.00),
                    ('Lemon Drink', 'Lemon refreshment', 20.00),
                    ('Jeera Drink', 'Spiced jeera cooler', 20.00),
                    ('Packaged Drinking Water', 'Purified drinking water', 15.00),
                ],
            },
        }

        created_categories = 0
        created_products = 0

        for category_name, category_info in data.items():
            category, cat_created = Category.objects.get_or_create(
                name=category_name,
                defaults={'description': category_info['description']},
            )
            if cat_created:
                created_categories += 1
            for name, description, price in category_info['products']:
                _, product_created = Product.objects.get_or_create(
                    category=category,
                    name=name,
                    defaults={
                        'description': description,
                        'price': price,
                        'is_available': True,
                    },
                )
                if product_created:
                    created_products += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seed complete. Categories created: {created_categories}, Products created: {created_products}'
            )
        )
