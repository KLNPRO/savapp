// src/app/pages/recipe-manager-page/recipe-manager-page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recette } from '../../models/recette.model';
import { RecetteService } from '../../services/recette.service';
import { Chart, registerables } from 'chart.js/auto';

Chart.register(...registerables);

@Component({
  selector: 'app-recipe-manager-page',
  imports: [CommonModule],
  templateUrl: './recipe-manager-page.html',
  styleUrl: './recipe-manager-page.css',
})
export class RecipeManagerPage implements OnInit {
  public recettes: Recette[] = [];
  public recetteSelectionnee: Recette | null = null;

  constructor(private recetteService: RecetteService) {}

  ngOnInit(): void {
    this.chargerRecettes();
  }

  chargerRecettes(): void {
    this.recetteService.getRecettes().subscribe({
      next: (data) => {
        this.recettes = data;
        setTimeout(() => {
          this.recettes.forEach(r => this.initChart(r));
        }, 100);
      },
      error: (err) => console.error('Erreur API', err)
    });
  }

  supprimerRecette(id: number): void {
    if (confirm('Supprimer cette recette ?')) {
      this.recetteService.deleteRecette(id).subscribe(() =>
        this.chargerRecettes()
      );
    }
  }

  ouvrirModale(recette: Recette): void {
    this.recetteSelectionnee = recette;
  }

  fermerModale(): void {
    this.recetteSelectionnee = null;
  }

  initChart(recette: Recette): void {
    const ctx = document.getElementById(`chart-${recette.id}`) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: recette.resultats.map(res => res.caracteristique.nom),
       datasets: [{
          label: 'Scores',
          data: recette.resultats.map(res => res.score),
          fill: true,
          backgroundColor: 'rgba(210, 0, 255, 0.2)',
          borderColor: 'rgb(210, 0, 255)',
          pointBackgroundColor: 'rgb(0, 180, 0)',
          pointBorderColor: 'rgb(0, 180, 0)',
        }]
      },
      options: {
        elements: { line: { borderWidth: 2 } },
        scales: { r: { suggestedMin: 0, suggestedMax: 100, ticks: { stepSize: 10 } } },
        plugins: { legend: { display: false } }
      }
   });
  }
}
