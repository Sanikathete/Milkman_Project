from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import CustomUser, Profile, StaffProfile


@receiver(post_save, sender=CustomUser)
def create_or_update_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        Profile.objects.get_or_create(user=instance)

    if instance.role == CustomUser.Role.ADMIN:
        StaffProfile.objects.get_or_create(user=instance)
