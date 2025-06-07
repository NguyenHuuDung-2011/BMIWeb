from django.db import models

# Create your models here.
class StudentHealth(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=4)
    week = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()

    def __str__(self):
        return self.name

    def bmi(self):
        return self.weight / (self.height ** 2) if self.height > 0 else 0