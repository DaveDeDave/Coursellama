# Coursellama
![logo](https://raw.githubusercontent.com/DaveDeDave/Coursellama/main/docs/llama_logo.png)

Coursellama is a web application for sharing courses. It is a project done at the University of Eastern Piedmont during the course of programming methodologies for the web.

## How to run?
1. open terminal in the coursellama dir
2. type **npm install** to install the dependencies
3. type **npm start** to run the application
4. open **localhost:3001** in your browser

![preview](https://raw.githubusercontent.com/DaveDeDave/Coursellama/main/docs/coursellama.png)

## Entity Relationship Diagram
Below is represented the Entity Relationship Diagram:

![ER](https://raw.githubusercontent.com/DaveDeDave/Coursellama/main/docs/EntityRelationshipDiagram.png)

## Utility

### Pre-existing users for testing
| username | password | role |
| ----------- | ----------- | ----------- |
| gianni96 | Password12# | student |
| Marco7 | Password12# | student |
| bianchi | Password12# | teacher |
| rossi | Password12# | teacher |
| milani | Password12# | teacher |

### Run on a different port
If you want to run the application on a different port, just change its value in the **.env** file.

### Restore db with testing values
The application is provided with test values. If you want to restore them, remove the **.sqlite** file in **coursellama/db** folder and restart the application.

### Generate new pair of keys for jwt
Type in your terminal:
- ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
- don't add passphrase
- openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
- replace the generated files with the ones in the **coursellama/controllers/keys** folder

## Technologies
- Node.js v14.7.1
- Express
- Server-side rendering - EJS
- Bootstrap
- JWT
- Sqlite3

## Disclaimer
All images and icons used in this project belong to their rightful owners
