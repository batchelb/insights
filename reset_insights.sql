drop Table insight;

CREATE TABLE insight (
	insightId int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book VARCHAR(30) NOT NULL,
    chapter VARCHAR(30) NOT NULL,
    verses VARCHAR(30),
    insight text,  
    rating int,
    personId int,
    dateRecored TIMESTAMP DEFAULT NOW()
);

INSERT INTO `insights`.`insight`
(`book`,
`chapter`,
`verses`,
`insight`,
`personId`)
VALUES
('Acts',
'1',
'29',
'This is an insight',
1);
