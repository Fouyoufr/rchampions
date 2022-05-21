# En cours de développement

## Page d'administration
 - Ajouter un journal administratif pour les messages des clients
 - Gestion du certificat de serveur dans la tuile "serveur et sécurité"  
   ```Options possible : 'off' (http uniquement),'test' (permet http + https), 'self' (autosigné), 'auto' (lestencrypt)```
 - Indiquer dans la config du serveur les ports d'écoute (http et https)

## Page d'accueil
>    ### Création d'une partie ==> Sélection aléatoire ?
>    ### Création d'un journal de campagne  
>    ### Message du jour/du moment/astuce aléatoire ?

## Génériques
 - Feedback utilisateur (email possible)
 - Modification de la partie
 - InfoPartie (réunion, url etc) ?
 - Purger les parties non accédées depuis plus d'un mois...
 - wsClientSend ==> webSocket.send
 - Sauvegarde de la partie accessible à l'utilisateur
 - Messagerie administrative => baser sur la langue des utilisateurs connectés ?
 - Editeur de boites...
 - Trier l'affichage des boites pour la sélection des decks

## boxes.json
 - en : tout à faire
 - Ajout Sinistres motivations (Ironheart et Nova ok)
 - fichier de translation de "Remote Champions" vers "rChampions" ? json prèt

## Greenlock ?
 
## Documentation

---

| Anotations |
| --- |
| Compteur pour erreurs websocket  ```62``` |
| docker build -t fouyou/rchampions:latest . --no-cache |