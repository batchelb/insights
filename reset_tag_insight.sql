DROP TABLE tag_insight;

CREATE TABLE `tag_insight` (
  `tagId` varchar(11) NOT NULL,
  `insightId` varcharacter(11) NOT NULL,
  PRIMARY KEY (`tagId`,`insightId`)
);


delimiter |
CREATE TRIGGER insert_insight BEFORE INSERT ON tag_insight
  FOR EACH ROW
  BEGIN
  DECLARE v_tagCount INT;
  DECLARE v_tagId INT;
	Select COUNT(*) INTO v_tagCount from tag where tagname = NEW.tagId;
    IF (v_tagCount) = 0 THEN
		INSERT INTO tag (tagName) VALUES (NEW.tagId);
    END IF;
    Select tagId INTO v_tagId from tag where tagname = NEW.tagId;
    SET NEW.tagId = v_tagId;
END;
|

delimiter ;