function LancerJeu() {

  function initialiserParametresJeu() {
    
    // Initialiser les paramètres du jeu
    magasinAsteroides = [];
    magasinMissiles = [];
    indiceAsteroide = -1;
    indiceMissileSuivant = -1;
    // position de départ du vaisseau au milieu 
    vaisseauPosX = 100;
    vaisseauPosY = canvas.height / 2;
    nombreMissilesTotal = 0;
    nombreAsteroidesTotal = 0;
    nombreAsteroidesTouches = 0;
    $('#gameOver').hide();
    var divJeu = $('#divJeu')[0];

    divChute = $(divJeu).find('#divChute');
    $(divChute).hide();
    gameOver = false;
    canvas.focus();

    divLooser = $(divJeu).find('#divLooser');
    $(divLooser).hide();

    imgChute = $(divChute).find('#imgChute');

  }

  function RedemarrerJeu() {
    initialiserParametresJeu();
    requestAnimationFrame(animerEspace);
  }

  function afficherJeuDemarre() {
    $('#tableauScore').html('Jeu démarré ! Protéger le vaisseau !');
  }

  function tirerMissile() {
    // Enregister le missile tiré pour suivre sa position.
    // Périodiquement à chaque cycle d'animation, les missiles et astéroïdes ont une nouvelle position et l'objectif est vérifié (est-ce que la cible visée est atteinte ?)
    // Lire le premier index du tableau avec un missile non défini (c'est à dire qui est sorti du jeu, soit parce qu'il a détruit un astéroïde, soit parce qu'il est sorti du canvas)
    // Ceci évite d'ajouter un élement (un missile) à chaque fois dans le tableau et utiliser plutôt un élément qui est déjà sorti du jeu
    // Arrow function avec prédicat pour lire le premier index du tableau avec un missile non défini
    let j = magasinMissiles.findIndex(i => i === undefined);
    if (j === -1) {
      // pas d'élément non défini trouvé : le missile est ajouté dans le tableau qui s'incrémente d'un élément
      j = ++indiceMissileSuivant;
    }
    nombreMissilesTotal += 1
    magasinMissiles[j] = obtenirUnMissile(180, vaisseauPosY + 30);
    
   if (gameOver) {
      // Le jeu redémarre au premier missile tiré
      RedemarrerJeu()
    }
        // Le message "jeu démarré" est affiché au premier missile tiré
    if (nombreMissilesTotal === 1) {
      afficherJeuDemarre();
    }
  }
  
  // Retourne la distance entre 2 points (la position du missile et la position d'un astéroïde)
  // Théorème de Pythagore
  function obtenirDistance(x1, y1, x2, y2) {
    const X = x2 - x1;
    const Y = y2 - y1;
    return Math.sqrt(X * X + Y * Y );
  }

  function animerEspace(dureeAnimation) {
    const deltaDuree = dureeAnimation - derniereDureeAnimation;
    // Créer un astéroïde toutes les 1000 ms
    if (deltaDuree > 1000) {
      creerUnAsteroide();
      derniereDureeAnimation = dureeAnimation;
    }
    context.beginPath();
    dessinerElementsJeu();
    for (let i = 0; i < magasinAsteroides.length; i++) {
      if (magasinAsteroides[i] !== undefined) {
        // x = x - vitesse
        magasinAsteroides[i].x -= magasinAsteroides[i].vitesse;

        // Astéroïde qui disparaît (non tiré et passé à côté du vaisseau)
        if (magasinAsteroides[i].x <= 0) {
          magasinAsteroides.splice(i, 1);
        }
      }
    }

    // Parcourir les missiles tirés
    for (let noMissileTire = 0; (noMissileTire < magasinMissiles.length); noMissileTire++) {
      dessinerMissiles();
      // Parcourir les astéroïdes pour chaque missile tiré
      for (let noAsteroide = 0; noAsteroide < magasinAsteroides.length; noAsteroide++) {
        if (magasinAsteroides[noAsteroide] !== undefined) {
          if (obtenirDistance(vaisseauPosX, vaisseauPosY, magasinAsteroides[noAsteroide].x, magasinAsteroides[noAsteroide].y) < 50) {
            // Vaisseau spatial détruit par un astéroïde

            dessinerExplosionVaisseau(vaisseauPosX, vaisseauPosY + 80);

            gameOver = true;

            break;
          } 

          if (magasinMissiles[noMissileTire] !== undefined) {
            if (obtenirDistance(magasinMissiles[noMissileTire].x, magasinMissiles[noMissileTire].y, magasinAsteroides[noAsteroide].x, magasinAsteroides[noAsteroide].y) < 50) {
  
              // Gérer la destruction d'un astéroïde
              if (magasinAsteroides[noAsteroide].type === 'coeur') {
                $(divChute).addClass("chute");
                $(divChute).show();

                $(divLooser).show();
                $(divLooser).addClass("tourner");

                gameOver = true;
              }

              //  Retirer l'astéroïde touché du magasin des astéroïdes (ensemble des astéroïdes)
              magasinAsteroides.splice(noAsteroide, 1);
              //  Retirer le missile tiré du magasin des missiles (ensemble des missiles)
              magasinMissiles.splice(noMissileTire, 1);
              nombreAsteroidesTouches++;
              
              // opérateur ternaire si sinon
              let lettreS = ((nombreAsteroidesTouches == 1) ? "" : "s");
              
              // interpolation d'un chaîne de caractères
              $('#tableauScore').html(`${nombreAsteroidesTouches} asteroïde${lettreS} détruit${lettreS}`);
              
              //break;
            }
          }
        }
      }

      if (magasinMissiles[noMissileTire] !== undefined) {
        magasinMissiles[noMissileTire].x += magasinMissiles[noMissileTire].vitesse;
        if (magasinMissiles[noMissileTire].x > canvas.width) {

          // missile qui disparaît du canvas sans toucher sa cible
          magasinMissiles.splice(noMissileTire, 1);
        }
      }
    } //for (var noMissileTire 
    
    if (!gameOver) {
      idAnimationEspace = requestAnimationFrame(animerEspace);
    } else {
      cancelAnimationFrame(idAnimationEspace);
      delai = 5000;
      //new Promise (resolve => setTimeout(() => resolve(1), 3000)) // 1
      if ($(divChute).hasClass("chute")) {

        $(divChute).one('animationend', () => 
          idDelai = setTimeout(function () {

            $(divChute).hide();
            $(divLooser).hide();
            if (gameOver) {
              $('#gameOver').show();
              $('#tableauScore').html('Vaisseau détruit par les asteroïdes ! Total asteroïdes détruits : ' + nombreAsteroidesTouches + ' : Appuyer sur la touche entrée pour recommencer le jeu');
            }
          }, delai)
        )
      } else {
        idDelai = setTimeout(function () {

          if (gameOver) {
            $('#gameOver').show();
            $('#tableauScore').html('Vaisseau détruit par les asteroïdes ! Total asteroïdes détruits : ' + nombreAsteroidesTouches + ' : Appuyer sur la touche entrée pour recommencer le jeu');
          }
        }, delai)
      }
   }
  }

  function dessinerElementsJeu() {
    const obtenirImageAsteroide = (t) => {
      switch (t) {
        case 'banane':
          return bananes;
          break;
        case 'coeur':
          return coeurs;
          break;
        case 'asteroide':
          return asteroides;
          break;
        default:
          return asteroides;
          break;
        }
      }

    // Chaque 1000 ms les éléments (vaisseau et astéroïdes) sont redessinés avec leur nouvelle position)
    var vaisseauSpatial = new Image();
    var asteroides = new Image();
    var bananes = new Image();
    var coeurs = new Image();
    vaisseauSpatial.src = "http://vignette1.wikia.nocookie.net/thedimensionsaga/images/f/f0/Spiff's_spacecraft.png/revision/latest?cb=20130716184758";
    asteroides.src = 'http://www.asteroidmission.org/wp-content/themes/osiris/public_assets/images/bennu-rendered.png';
    bananes.src = 'bananes.png';
    coeurs.src = 'cœur.png';
    vaisseauSpatial.onload = function () {
      asteroides.onload = function () {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.drawImage(vaisseauSpatial, vaisseauPosX, vaisseauPosY, 60, 60);
        for (let i = 0; i < magasinAsteroides.length; i++) {
          if (magasinAsteroides[i] !== undefined) {

            context.drawImage(obtenirImageAsteroide(magasinAsteroides[i].type), magasinAsteroides[i].x, magasinAsteroides[i].y, 40, 40);
          }
        }
      };
    };
  }

  function dessinerMissiles() {
    for (let i = 0; i < magasinMissiles.length; i++) {
      if (magasinMissiles[i] !== undefined) {
        context.beginPath();
        context.fillStyle = "gold";
        context.arc(magasinMissiles[i].x, magasinMissiles[i].y, magasinMissiles[i].rayon, 0, 360);
        context.fill();
        context.closePath();
      }
    }
  }

  function dessinerExplosionVaisseau (x, y) {
    var explosion = new Image();
    //explosion.src = '../img/explosion.png';
    explosion.src = 'explosion.png';
    explosion.onload = function () {
      context.drawImage(explosion, x, y, 200, 200);
    }
  }

  function obtenirUnMissile(x, y) {
    // Retourne une instance de classe Missile
    return {
      'rayon': 8,
      'x': x,
      'y': y,
      'vitesse': 20
    };
  }

  function initialiserParametresUnAsteroide(x, y, coloR, typeAsteroïde) {
    // Retourne une instance de classe contenant les valeurs des propriétés d'un astéroïde

    // Vitesses variables possibles des astéroides
      const vitesses = [0.1, 0.5, 1.5, 3.5, 5.5, 7.5, 13, 17];
    // Lit une vitesse aléatoire dans le tableau : Math.getRandomInt retourne un entier aléatoire entre 0 et la dimension du tableau
    v = vitesses[Math.floor(Math.random() * vitesses.length)];

    return {
      'x': x,
      'y': y,
      'coloR': coloR,
     'vitesse': v,
      'type': typeAsteroïde // astéroïde ou banane
    };
  }
  
  // Renvoi un entier aléatoire entre 20 inclus et 500 exclu donnant la position y d'un nouvel astéroïde à créer
  function genererEntierAleatoire() {
    return Math.random() * (500 - 20) + 20;
  }

  // Créer un astéroïde
  function creerUnAsteroide() {
    
    const obtenirTypeAsteroide = (n) => {
      if ((n%5) === 0)
        return 'banane'
      else if  ((n%21) === 0) 
        return 'coeur'
      else
        return 'asteroide'
    }

    let j = magasinAsteroides.findIndex(i => i === undefined);
    if (j === -1) {
      // pas d'élément non défini trouvé : l'astéroïde est ajouté dans le tableau qui s'incrémente d'un élément
      j = ++indiceAsteroide;
    }
    nombreAsteroidesTotal += 1;

    magasinAsteroides[j] = initialiserParametresUnAsteroide(canvas.width, genererEntierAleatoire(), "darkgrey", obtenirTypeAsteroide(nombreAsteroidesTotal));
  }

  // ###############################
  // ## Début programme principal ##
  // ###############################

  // Cacher le texte "Jeu terminé"
 // $('#gameOver').hide();

  // Lire le canvas de l'espace traversé par le vaisseau spatial (l'élément HTML conteneur servant à dessiner des objets)
  var canvas = document.getElementById('canvasEspace');
  divEspace = canvas.parentElement;

  context = canvas.getContext('2d');

  // Initialiser les paramètres du jeu
  initialiserParametresJeu();

  // Gérer les événements de la souris
  // #################################

  // Les événements sont écoutés sur divEspace (objet HTML parent de tous les autres)
  // plutôt que sur canvas car quand le jeu est terminé, canvas perd le focus au profit du div gameOver qui affiche "Jeu terminé" sur toute la page
  // Ainsi, il est possible sur l'événement enter du pavé numérique de recommencer le jeu

  // Gérer les événements de mouvement de la souris
  divEspace.addEventListener('mousemove', function (evenement) {
    vaisseauPosY = evenement.pageY;
  });

  // Gérer les événements de click de la souris

  divEspace.addEventListener('click', function (evenement) {
    tirerMissile();
  });

  // Gérer les événements du clavier
  // ###############################

  // Gérer l'événement keydown

  divEspace.onkeydown = function (evenement) {
    // Gérer les événements clavier
    switch (evenement.code) {
      // Flèche pour monter
      case 'ArrowUp':
        // Descendre de 10 unités
        vaisseauPosY -= 10;
        break;
      // Flèche pour descendre
      case 'ArrowDown':
        // Monter de 10 unités
        vaisseauPosY += 10;
        break;
      // Touche espace
      case 'Space':
        tirerMissile();
        break;

      // Recommencer le jeu
      case 'NumpadEnter':
        if (gameOver) {
          RedemarrerJeu()
        }
        break;
    };
  };

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
/*
  // Déclencher un timer pour animer le jeu en créant un astéroïde chaque 800 ms
  idDelai = setInterval (function () {
    creerUnAsteroide();
  }, 800);
*/
  let derniereDureeAnimation = 0;

  animerEspace(derniereDureeAnimation);
}

$(document).ready(function () {

  LancerJeu();
});
