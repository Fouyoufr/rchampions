# En cours de développement

!!!!!! Mettre le warning de perte temporaire de connexion dans un autre div que les erreurs pour qu'elles ne disparaissent pas !!!!!

## Page d'administration
 - Ajouter deux journaux administratifs : un pour les messages des clients et un des actions administrativs
 - Ajouter une option de "*push-refresh*" des clients pour que tous les connectés regénérent leur id (avec un simple refresh) après une panne serveur
 - Console serveur
 - Ajouter une otpion de "stopWebsocket" pour inviter les clients à raffraichir
 - Gestion du certifcat de serveur + mot de passe dans une tuile "serveur et sécurité"  
   >Options possibkle : 'off' (http uniquement),'test' (permet http + https), 'self' (autosigné), 'auto' (lestencrypt)

## Création d'une partie
 - Gestion des box / decks

## Page d'accueil
 - Gérer la connexion à une partie en page d'accueil + Gérer l'affichage propre "**partie inconnue**" plutôt que rediriger ver la page game.html  

## Génériques
 - Ajouter les autres boites de jeu
 - Feedback utilisateur (email possible)

## Greelock

## Setup

## Melodice

## Compteur pour erreurs websocket : ```55```

## Docker
docker build -t fouyou/rchampions . --no-cache