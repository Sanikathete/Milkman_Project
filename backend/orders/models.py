from django.db import models


class Order(models.Model):
    class PaymentMethod(models.TextChoices):
        CARD = 'Card', 'Card'
        UPI = 'UPI', 'UPI'
        NETBANKING = 'NetBanking', 'Net Banking'
        COD = 'COD', 'Cash on Delivery'

    class PaymentStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        PAID = 'Paid', 'Paid'
        FAILED = 'Failed', 'Failed'

    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, related_name='orders')
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, blank=True)
    payment_reference = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'Order<{self.user.email} - {self.product.name}>'
