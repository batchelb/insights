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
INSERT INTO storyboard (storyboardId,storyboardName) VALUES (null,'kaljf2');

delimiter |
CREATE TRIGGER update_storyboard BEFORE Update ON storyboard
  FOR EACH ROW
  BEGIN
  DELETE FROM storyboard_insight where storyboardId = NEW.storyboardId;
  DELETE FROM connection where storyboardId = NEW.storyboardId;
END;
|
delimiter ;

select 'red'
