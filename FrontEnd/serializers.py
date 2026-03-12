from rest_framework import serializers
from .models import Recurs, Autor, CategoriaRecurs


class RecursSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Recurs
        fields = ['id', 'titol', 'descripcio', 'categoria', 'data_publicacio', 'is_activ']

    def validate_titol(self, value):
        if not value.strip():
            raise serializers.ValidationError("El títol és obligatori.")
        return value.strip()

    def validate_categoria(self, value):
        valid = [choice[0] for choice in CategoriaRecurs.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f"Categoria no vàlida. Opcions: {', '.join(valid)}"
            )
        return value


class AutorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Autor
        fields = ['id', 'nom', 'cognoms', 'email', 'data_naixement', 'càrrec']

    def validate_nom(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nom és obligatori.")
        return value.strip()

    def validate_cognoms(self, value):
        if not value.strip():
            raise serializers.ValidationError("Els cognoms són obligatoris.")
        return value.strip()

    def validate_email(self, value):
        # On update, exclude the current instance from the uniqueness check
        qs = Autor.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Aquest correu ja existeix.")
        return value
