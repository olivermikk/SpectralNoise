from django import forms
from .models import Algorithm, AlgorithmVariation

class AlgorithmForm(forms.ModelForm):
    class Meta:
        model = Algorithm
        fields = ['name']

class AlgorithmVariationForm(forms.ModelForm):
    class Meta:
        model = AlgorithmVariation
        fields = ['algorithm', 'priority_type', 'file', 'available']
        widgets = {
            'priority_type': forms.Select(attrs={'class': 'form-control'}),
            'file': forms.FileInput(attrs={'class': 'form-control'}),
            'available': forms.CheckboxInput(attrs={'class': 'form-check-input'})  # Styling checkbox
        }

    def clean_file(self):
        # If there's a file already uploaded for the variation, disallow adding another one.
        file = self.cleaned_data.get('file')
        if file and self.instance.pk:
            if self.instance.__class__.objects.filter(file__isnull=False).exclude(id=self.instance.id).exists():
                raise forms.ValidationError("A file has already been uploaded for this variation.")
        return file
