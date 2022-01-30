from django.db import models

# Create your models here.
class Song(models.Model):
    name = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    spotify_id = models.CharField(max_length=200)
    rating = models.IntegerField()

class Vote(models.Model):
    time = models.DateField()
    rating_before = models.IntegerField()
    rating_after = models.IntegerField()
    song = models.ForeignKey(Song, on_delete=models.CASCADE)

class Category(models.Model):
    name = models.CharField(max_length=200)
    songs = models.ManyToManyField(Song)
