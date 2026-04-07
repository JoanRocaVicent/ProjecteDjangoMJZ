# Create your models here.
from django.db import models
import datetime
from django.utils import timezone
from django.contrib import admin
from django.core.validators import EmailValidator

# Create your models here.


class CategoriaRecurs(models.TextChoices):
    # Defineix les categories com una enumeració
    TECNOLOGIA = 'TEC', 'Tecnologia'
    EDUCACIO = 'EDU', 'Educació'
    SALUT = 'SAL', 'Salut'
    ENTRETENIMENT = 'ENT', 'Entreteniment'
    ALtres = 'ALT', 'Altres'

class Recurs(models.Model):
    titol = models.CharField(max_length=200, verbose_name="Títol", help_text="Títol del recurs (obligatori)", blank=False)
    descripcio = models.TextField(verbose_name="Descripció", help_text="Descripció del recurs", blank=True, null=True)
    categoria = models.CharField(
        max_length=3,
        verbose_name="Categoria",
        choices=CategoriaRecurs.choices,
        default=CategoriaRecurs.ALtres,
        help_text="Categoria del recurs"
    )
    data_publicacio = models.DateTimeField(
        verbose_name="Data de Publicació",
        help_text="Data en què es va publicar el recurs",
        default=timezone.now
    )
    is_activ = models.BooleanField(
        verbose_name="Està Actiu",
        help_text="Indica si el recurs està actiu",
        default=True
    )
    autor = models.ForeignKey(
        'Autor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recursos',
        verbose_name="Autor",
        help_text="Autor del recurs"
    )

    class Meta:
        verbose_name = "Recurs"
        verbose_name_plural = "Recursos"

    def __str__(self):
        return self.titol
    

class Autor(models.Model):
    nom = models.CharField(
        max_length=100,
        verbose_name="Nom",
        help_text="Nom de l'autor (obligatori)",
        blank=False
    )
    cognoms = models.CharField(
        max_length=200,
        verbose_name="Cognoms",
        help_text="Cognoms de l'autor (obligatori)",
        blank=False
    )
    email = models.EmailField(
        verbose_name="Correu electrònic",
        help_text="Correu electrònic de l'autor (únic)",
        unique=True,
        validators=[EmailValidator(message="Si us plau, introdueix un correu electrònic vàlid.")]
    )
    data_naixement = models.DateField(
        verbose_name="Data de naixement",
        help_text="Data de naixement de l'autor",
        null=True,
        blank=True
    )
    càrrec = models.CharField(
        max_length=100,
        verbose_name="Càrrec",
        help_text="Càrrec o posició de l'autor",
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = "Autor"
        verbose_name_plural = "Autors"

    def __str__(self):
        return f"{self.nom} {self.cognoms}"
