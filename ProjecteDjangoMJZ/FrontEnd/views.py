from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Recurs, Autor
from .serializers import RecursSerializer, AutorSerializer


# ── Page view ────────────────────────────────────────────────────

def index(request):
    from django.shortcuts import render
    return render(request, 'FrontEnd/index.html')


# ── Recurs ───────────────────────────────────────────────────────

class RecursListView(APIView):
    """
    GET  /api/recursos/   → list all Recurs
    POST /api/recursos/   → create a new Recurs
    """

    def get(self, request):
        recursos = Recurs.objects.all().order_by('-data_publicacio')
        serializer = RecursSerializer(recursos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RecursSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecursDetailView(APIView):
    """
    GET    /api/recursos/<id>/   → retrieve a Recurs
    DELETE /api/recursos/<id>/   → delete a Recurs
    """

    def get(self, request, pk):
        recurs = get_object_or_404(Recurs, pk=pk)
        serializer = RecursSerializer(recurs)
        return Response(serializer.data)

    def delete(self, request, pk):
        recurs = get_object_or_404(Recurs, pk=pk)
        recurs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Autor ────────────────────────────────────────────────────────

class AutorListView(APIView):
    """
    GET  /api/autors/   → list all Autor
    POST /api/autors/   → create a new Autor
    """

    def get(self, request):
        autors = Autor.objects.all().order_by('cognoms', 'nom')
        serializer = AutorSerializer(autors, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AutorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AutorDetailView(APIView):
    """
    GET    /api/autors/<id>/   → retrieve an Autor
    DELETE /api/autors/<id>/   → delete an Autor
    """

    def get(self, request, pk):
        autor = get_object_or_404(Autor, pk=pk)
        serializer = AutorSerializer(autor)
        return Response(serializer.data)

    def delete(self, request, pk):
        autor = get_object_or_404(Autor, pk=pk)
        autor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
