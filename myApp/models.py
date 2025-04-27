from django.db import models

class Algorithm(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class AlgorithmVariation(models.Model):
    PRIORITY_CHOICES = [
        ('frequency', 'Frequency Priority'),
        ('amplitude', 'Amplitude Priority'),
        ('tone', 'Tone Priority'),
        ('both', 'Both Frequency & Amplitude'),
    ]

    name = models.CharField(max_length=255)
    algorithm = models.ForeignKey(Algorithm, on_delete=models.CASCADE, related_name="variations")
    priority_type = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    file = models.FileField(upload_to='media/algorithm_files/', blank=True, null=True)  # Uploads file if applicable
    available = models.BooleanField(default=False)  # Tracks if this variation is ready to use

    def __str__(self):
        return f"{self.algorithm.name} - {self.get_priority_type_display()} - {self.get_priority_type_display()}"

    def clean(self):
        # Ensure only one file is uploaded per variation
        if self.file and self.pk:  # Check if there is a file and the variation is already in the database
            if self.__class__.objects.filter(file__isnull=False).exclude(id=self.id).exists():
                raise ValidationError("A file has already been uploaded for another variation.")
