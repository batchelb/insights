CREATE OR REPLACE VIEW storyboard_vw as
select s.storyboardId, s.storyboardName, i.insightId, book, chapter, verses, rating, insight,  si.`order`
	from storyboard_insight si
	INNER JOIN storyboard s on s.storyboardId = si.storyboardId
	left Join insight i on i.insightId = si.insightId
    where personId = 1
union
select s.storyboardId, s.storyboardName, connection, null,null, null, null, null, c.`order` 
	from connection c 
	inner join storyboard s on c.storyboardId = s.storyboardId
	LEFT JOIN storyboard_insight si on s.storyboardId = si.storyboardId
	LEFT Join insight i on i.insightId = si.insightId
	where personId = 2
order by `order`;

INSERT connection (storyboardId, connection, `order`) VALUES (1, 'Nephi is brave',3);
INSERT connection (storyboardId, connection, `order`) VALUES (1, 'Nephi is a man',5);
INSERT INTO storyboard_insight (storyboardId,insightId,`order`) VALUES (1,1,2);
INSERT INTO storyboard_insight (storyboardId,insightId,`order`) VALUES (1,2,1);
INSERT INTO storyboard_insight (storyboardId,insightId,`order`) VALUES (1,3,4);
INSERT INTO storyboard (storyboardId,storyboardName) VALUES (100,'kaljf2');
CREATE TABLE sequence (
	sequenceNum int(20) primary Key
);
INSERT INTO sequence values (1);
CREATE TABLE spider_lines (
	lineId int primary Key AUTO_INCREMENT,
    spiderboardId int(10),
    startingInsightId int(10),
    endingInsightId int(10)
);

DROP TABLE spiderboard;
delete from spiderboard;
delete from spider_lines;
delete from spider_insight;
delete from spider_connection;
CREATE TABLE spiderboard(
	spiderboardId int(10) primary Key AUTO_INCREMENT,
    spiderboardName varchar(50),
    personId int(10),
    createDate timestamp NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE spiderboard;
CREATE TABLE spider_connection(
	spiderboardId int(10),
    connectionId int(10),
    `connection` text,
    top_position int(10),
    left_position int(10)
);
CREATE TABLE spider_insight(
	spiderboardId int(10),
    insightId int(10),
    top_position int(10),
    left_position int(10)
);
BEFORE INSERT INTO 
delimiter |
CREATE TRIGGER create_insight BEFORE INSERT ON insight
	FOR EACH ROW
	BEGIN
	  SET NEW.insightId = (SELECT MAX(sequenceNum + 1) FROM sequence);
      INSERT INTO sequence values (NEW.insightId);
	END;
|
delimiter ;
INSERT INTO `connection` (`connection`) VALUES ('a huge thought')
select * from connection
BEFORE INSERT INTO 
delimiter |
CREATE TRIGGER create_connection BEFORE INSERT ON connection
	FOR EACH ROW
	BEGIN
	  SET NEW.connectionId = (SELECT MAX(sequenceNum + 1) FROM sequence);
      INSERT INTO sequence values (NEW.connectionId);
	END;
|
delimiter ;

DROP TRIGGER create_spider_connection
delimiter |
CREATE TRIGGER create_spider_connection BEFORE INSERT ON spider_connection
	FOR EACH ROW
	BEGIN
	  SET NEW.connectionId = (SELECT MAX(sequenceNum + 1) FROM sequence);
      INSERT INTO sequence values (NEW.connectionId);
	END;
|
delimiter ;
INSERT INTO spider_connection (spiderboardId,connection,top_position,left_position) VALUES (null,'what the spider conneciton',200, 100);
select * from spider_connection;
select * from sequence;
delete from insight
select * from insight
INSERT INTO insight (book,chapter,verses,insight,rating,personId, dateRecored) VALUES ('book','chapter','verses','insight','rating',1,SYSDATE())
select * from sequence
delimiter |
CREATE TRIGGER delete_spiderboard AFTER DELETE ON spiderboard
  FOR EACH ROW
  BEGIN
	  DELETE FROM spider_insight where spiderboardId = OLD.spiderboardId;
	  DELETE FROM spider_connection where spiderboardId = OLD.spiderboardId;
      DELETE FROM spider_line where spiderboardId = OLD.spiderboardId;
	END;
|
delimiter ;
delimiter |
CREATE TRIGGER update_spiderboard AFTER UPDATE ON spiderboard
  FOR EACH ROW
  BEGIN
	  DELETE FROM spider_insight where spiderboardId = OLD.spiderboardId;
	  DELETE FROM spider_connection where spiderboardId = OLD.spiderboardId;
      DELETE FROM spider_line where spiderboardId = OLD.spiderboardId;
	END;
|
delimiter ;

DROP TRIGGER delete_storyboard
delimiter |
CREATE TRIGGER update_storyboard AFTER UPDATE ON storyboard
  FOR EACH ROW
  BEGIN
  DELETE FROM storyboard_insight where storyboardId = OLD.storyboardId;
  DELETE FROM connection where storyboardId = OLD.storyboardId;
END;
|
delimiter ;

select 'red';
Drop Table `storyboard_insight`;
CREATE TABLE `storyboard_insight` (
  `stroyboardInsightId` int Primary Key, 
  `storyboardId`int(10) NOT NULL,
  `insightId` int(10) NOT NULL,
  `order` int(11) NULL,
  PRIMARY KEY (`storyboardId`,`insightId`,`order`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

select * from storyboard_insight;
select * from connection;
Delete from storyboard where storyboardId = 1;

CREATE TABLE `connection` (
  `connectionId` int(11) NOT NULL AUTO_INCREMENT,
  `storyboardId` varchar(10) NOT NULL,
  `connection` text NOT NULL,
  `order` int(11) NOT NULL,
  PRIMARY KEY (`connectionId`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;

SELECT s.spiderboardId, spiderboardName, si.insightId,si.top_position,si.left_position, book, chapter, verses, insight, rating
FROM spiderboard s 
INNER JOIN spider_insight si ON si.spiderboardId = s.spiderboardId
INNER JOIN insight i ON i.insightId = si.insightId
WHERE s.personId = %s

SELECT c.connectionId, c.connection, c.top_position, c.left_position
FROM spiderboard s
INNER JOIN spider_connection c ON c.spiderboardId = s.spiderboardId
WHERE s.personId = %s

SELECT startingInsightId,endingInsightId
FROM spider_lines l
INNER JOIN spiderboard s on s.spiderboardId = l.spiderboardId
WHERE s.personId = %s

SELECT * FROM spiderboard
