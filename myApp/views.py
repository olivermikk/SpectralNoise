from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.conf import settings

from django.contrib.auth.decorators import login_required
from .models import Algorithm, AlgorithmVariation
from .forms import AlgorithmForm, AlgorithmVariationForm

from django.http import JsonResponse
from django.contrib.auth.decorators import user_passes_test





# views.py
from django.shortcuts import render

def landing_page(request):
    return render(request, 'landing.html')

def about_page(request):
    return render(request, 'about.html')

def faq_page(request):
    return render(request, 'faq.html')




def visualizer_page(request):
    # Show all algorithms for staff, otherwise only those with available variations
    if request.user.is_authenticated and request.user.is_staff:
        algorithms = Algorithm.objects.all()
    else:
        algorithms = Algorithm.objects.filter(variations__available=True).distinct()

    return render(request, 'visualizer.html', {
        'algorithms': algorithms,
    })







def admin_login(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Authenticate the user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Log the user in
            login(request, user)
            # Get the 'next' parameter, defaulting to 'admin_panel'
            next_url = request.GET.get('next', 'admin_panel')
            return redirect(next_url)
        else:
            messages.error(request, "Invalid credentials.")
            return render(request, 'myApp/admin_login.html')

    return render(request, 'myApp/admin_login.html')


def admin_logout(request):
    logout(request)
    return redirect("landing")


@login_required

def admin_panel(request):
    algorithms = Algorithm.objects.all()
    algo_form = AlgorithmForm()
    variation_form = AlgorithmVariationForm()

    if request.method == "POST":
        # Handle the "Add Algorithm" form submission (without file upload)
        if "add_algorithm" in request.POST:
            algo_form = AlgorithmForm(request.POST)
            if algo_form.is_valid():
                algo_form.save()
                return redirect("admin_panel")

        # Handle the "Add Algorithm Variation" form submission (with file upload)
        if "add_variation" in request.POST:
            variation_form = AlgorithmVariationForm(request.POST, request.FILES)  # Handling file upload
            if variation_form.is_valid():
                variation = variation_form.save()  # Save the variation instance

                # Handle the uploaded file (if there is one)
                uploaded_file = request.FILES.get(
                    'file_field_name')  # Change 'file_field_name' to the actual field name in the form
                if uploaded_file:
                    # Process the file or save it if needed (for example, associate it with the variation)
                    variation.file_field_name = uploaded_file  # Update the variation with the uploaded file (replace 'file_field_name' with actual field name)
                    variation.save()  # Save the updated variation with the uploaded file

                return redirect("admin_panel")

    return render(request, "admin_panel.html", {
        "algo_form": algo_form,
        "variation_form": variation_form,
        "algorithms": algorithms
    })


def delete_algorithm(request, algorithm_id):
    algorithm = get_object_or_404(Algorithm, id=algorithm_id)
    algorithm.delete()
    return redirect("admin_panel")

def delete_variation(request, variation_id):
    variation = get_object_or_404(AlgorithmVariation, id=variation_id)
    variation.delete()
    return redirect("admin_panel")


def get_variations_by_algorithm(request):
    if request.method == "GET":
        algorithm_id = request.GET.get('algorithm_id')

        if algorithm_id:
            try:
                algorithm = Algorithm.objects.get(id=algorithm_id)

                if request.user.is_authenticated and request.user.is_staff:
                    variations = AlgorithmVariation.objects.filter(algorithm=algorithm)
                else:
                    variations = AlgorithmVariation.objects.filter(algorithm=algorithm, available=True)

                variations_data = [
                    {
                        'id': variation.id,
                        'name': variation.name,
                        'priority_type': variation.get_priority_type_display(),
                        'file': variation.file.url if variation.file else None
                    }
                    for variation in variations
                ]

                return JsonResponse({'variations': variations_data})

            except Algorithm.DoesNotExist:
                return JsonResponse({'error': 'Algorithm not found'}, status=404)

        return JsonResponse({'variations': [], 'error': 'No algorithm selected'}, status=400)







def get_visualizer_script(request, variation_id):
    try:
        variation = AlgorithmVariation.objects.get(id=variation_id)
        # Use the media URL and join it with the file path
        script_url = settings.MEDIA_URL + str(variation.file)  # File path is already relative to MEDIA_ROOT
        return JsonResponse({'script_url': script_url})
    except AlgorithmVariation.DoesNotExist:
        return JsonResponse({'error': 'Variation not found'}, status=404)



@user_passes_test(lambda user: user.is_staff)

def update_variation_availability(request, variation_id):
    if request.method == 'POST' and request.user.is_staff:
        variation = AlgorithmVariation.objects.get(id=variation_id)
        variation.available = request.POST.get('available') == 'on'
        variation.save()
        return redirect('admin_panel')  # Redirect back to admin panel or wherever needed
    return redirect('admin_panel')  # Fallback if not post or not admin

