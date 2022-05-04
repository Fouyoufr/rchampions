# En cours de développement

## Page d'administration
 - Ajouter un journal administratif pour les messages des clients
 - Gestion du certificat de serveur + mot de passe dans la tuile "serveur et sécurité"  
   ```Options possible : 'off' (http uniquement),'test' (permet http + https), 'self' (autosigné), 'auto' (lestencrypt)```
 - Indiquer dans la config du serveur le port https pour la redirection
 - Sauvegarde globale et restauration
 - (Nouvelle partie depuis la page admin ?)

## Page d'accueil
>    ### Création d'une partie
>     - Sélection aléatoire ?
>    ### Création d'un journal de campagne  
>    ### Message du jour/du moment/astuce aléatoire ?

## Génériques
 - Ajouter les autres boites de jeu
 - Feedback utilisateur (email possible)
 - Gestion des mots clef
 - Modification de la partie
 - Ecrans périphériques mobiles
 - InfoPartie (réunion, url etc)
 - Retravailler le contenu des popups...

## boxes.json
 - fr : reste sideSchemes
 - en : tout à faire
 - fichier de translation de "Remote Champions" vers "rChampions" ?

## Greenlock ?
 
## Setup ?
 - probabelment pas : le nouveau site est immédiatement exploitable après démarrage

## Melodice

---

| Anotations |
| --- |
| Compteur pour erreurs websocket  ```60``` |
| docker build -t fouyou/rchampions:latest . --no-cache |