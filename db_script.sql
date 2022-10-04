create database cocktail_db;

CREATE TABLE CocktailTable(
  id INT NOT NULL,
  cocktail_title TEXT NOT NULL,
  review TEXT NOT NULL,
  review_date TIMESTAMP NOT NULL
  );

INSERT INTO CocktailTable(id, cocktail_title,review,review_date)
    VALUES(17196,'Cosmopolitan','fun!','2021-12-09 11:49:10');

INSERT INTO CocktailTable(id, cocktail_title,review,review_date)
    VALUES(11007,'Margarita','Perfect amount of sweet and sour. Make sure to drink with the salt.','2021-12-09 11:49:10');