from django.test import TestCase
from django.urls import reverse
from .models import StudentHealth

# Create your tests here.
class HomePageViewTest(TestCase):
    def test_home_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home.html')

    def setUp(self):
        StudentHealth.objects.create(
            name="Jane Doe",
            age=20,
            gender="Nữ",
            week=1,
            height=175,
            weight=70
        )
    
    def test_view_url_exists_at_proper_location(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_view_url_by_name(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)

    def test_view_uses_correct_template(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home.html')

class StudentHealthModelTests(TestCase):
    def setUp(self):
        StudentHealth.objects.create(
            name="John Doe",
            age=20,
            gender="Nam",     # Add gender
            week=1,           # Add week
            height=175,
            weight=70
        )

    def test_student_health_content(self):
        student = StudentHealth.objects.get(name="John Doe")
        expected_object_name = f'{student.name}'
        self.assertEqual(expected_object_name, 'John Doe')