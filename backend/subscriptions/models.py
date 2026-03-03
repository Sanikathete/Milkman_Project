from django.db import models
from django.db.models import Q


class Subscription(models.Model):
    class PaymentMethod(models.TextChoices):
        CARD = 'Card', 'Card'
        UPI = 'UPI', 'UPI'
        NETBANKING = 'NetBanking', 'Net Banking'
        COD = 'COD', 'Cash on Delivery'

    class Frequency(models.TextChoices):
        DAILY = 'Daily', 'Daily'
        WEEKLY = 'Weekly', 'Weekly'
        MONTHLY = 'Monthly', 'Monthly'

    class PaymentStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        PAID = 'Paid', 'Paid'
        FAILED = 'Failed', 'Failed'

    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='subscriptions')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, related_name='subscriptions')
    frequency = models.CharField(max_length=20, choices=Frequency.choices)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, blank=True)
    payment_reference = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'product'],
                condition=Q(is_active=True),
                name='unique_active_subscription_per_product',
            )
        ]

    def __str__(self):
        return f'{self.user.email} - {self.product.name}'
