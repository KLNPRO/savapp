// src/app/pages/recipe-calculator-page/recipe-calculator-page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';
import { LigneIngredient, Recette } from '../../models/recette.model';
import { LigneIngredientDTO, RecetteFormDTO } from '../../models/dto.model';
import { IngredientService } from '../../services/ingredient.service';
import { RecetteService } from '../../services/recette.service';

@Component({
  selector: 'app-recipe-calculator-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './recipe-calculator-page.html',
  styleUrl: './recipe-calculator-page.css',
})
export class RecipeCalculatorPage implements OnInit {
  public ingredientsDispo: Ingredient[] = [];
  public choixIngredient: Ingredient | null = null;
  public selectionIngredients: LigneIngredient[] = [];
  public masseTotale = 0;
  public recetteAffichee: Recette | null = null;

  public nouvelleRecetteDTO: RecetteFormDTO = {
    id: null,
    titre: '',
    description: '',
    surgraissage: 0,
    avecSoude: false,
    concentrationAlcalin: 0,
    ligneIngredients: []
  };

  constructor(
    private ingredientService: IngredientService,
    private recetteService: RecetteService
  ) {}

  ngOnInit(): void {
    this.ingredientService.getIngredients().subscribe(data =>
      this.ingredientsDispo = data
    );
  }

  ajouterIngredient(): void {
    if (this.choixIngredient &&
        this.selectionIngredients.find(l => l.ingredient.id === this.choixIngredient?.id)) {
      return;
    }
    this.selectionIngredients.push({
      ingredient: this.choixIngredient!,
      quantite: 0,
      pourcentage: 0
    });
    this.choixIngredient = null;
  }

  recalculerPourcentages(): void {
    this.masseTotale = this.selectionIngredients.reduce(
      (acc, ligne) => acc + ligne.quantite, 0
    );
    this.selectionIngredients.forEach(ligne => {
      ligne.pourcentage = this.masseTotale > 0
        ? +(ligne.quantite / this.masseTotale * 100).toFixed(0)
        : 0;
    });
  }

  supprimerIngredient(index: number): void {
    this.selectionIngredients.splice(index, 1);
    this.recalculerPourcentages();
  }

  reinitialiser(): void {
    this.nouvelleRecetteDTO = {
      id: null, titre: '', description: '',
      surgraissage: 0, avecSoude: false,
      concentrationAlcalin: 0, ligneIngredients: []
    };
    this.selectionIngredients = [];
    this.masseTotale = 0;
    this.recetteAffichee = null;
  }

  onSubmit(): void {
    if (!this.nouvelleRecetteDTO.titre) {
      alert('Veuillez saisir un titre pour la recette.');
      return;
    }
    if (this.selectionIngredients.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient.');
      return;
    }
    if (this.selectionIngredients.some(l => l.quantite <= 0)) {
      alert('Toutes les quantités doivent être supérieures à zéro.');
      return;
    }

    const ligneIngredientDTOs: LigneIngredientDTO[] = this.selectionIngredients.map(ligne => ({
      quantite: ligne.quantite,
      pourcentage: ligne.pourcentage,
      ingredientId: ligne.ingredient?.id ?? 0
    }));

    const recetteEnvoyee: RecetteFormDTO = {
      ...this.nouvelleRecetteDTO,
      ligneIngredients: ligneIngredientDTOs
    };

    this.recetteService.createRecette(recetteEnvoyee).subscribe({
      next: (recette: Recette) => {
        this.recetteAffichee = recette;
        alert('Recette calculée et enregistrée avec succès !');
      },
      error: () => {
        alert('Erreur lors du calcul. Vérifiez vos données et que l\'API est lancée.');
      }
    });
  }
}
