Drop Table person;

CREATE TABLE `person` (
  `personId` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `hash` text DEFAULT NULL,
  `username` varchar(10) DEFAULT NULL,
  `sessionToken` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`personId`)
);

INSERT INTO `insights`.`person`
(`personId`,
`hash`,
`username`,
`sessionToken`)
VALUES
(1,
1,
batchelb,
1);
