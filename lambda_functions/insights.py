import sys
import logging
import rds_config
import pymysql
import json
import hashlib
import datetime
#rds settings
rds_host  = "insights.c5wijtdvglsm.us-west-1.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name
# {
#   "body" : $input.json('$'),
#   "headers": {
#     #foreach($param in $input.params().header.keySet())
#     "$param": "$util.escapeJavaScript($input.params().header.get($param))" #if($foreach.hasNext),#end

#     #end
#   }
# }
try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except:
    sys.exit()
conn.autocommit(True)

def get_story_board(event, context):
    personId = authorize(event['headers']['Authorization'].split(' ')[1])
    with conn.cursor() as cur:
        cur.execute("""select s.storyboardId, s.storyboardName, i.insightId, book, chapter, verses, rating, insight,  si.`order`
                    	from storyboard_insight si
                    	INNER JOIN storyboard s on s.storyboardId = si.storyboardId
                    	left Join insight i on i.insightId = si.insightId
                        where personId = %s
                        union
                        select s.storyboardId, s.storyboardName, connection, null,null, null, null, null, c.`order`
                        	from connection c
                        	inner join storyboard s on c.storyboardId = s.storyboardId
                        	LEFT JOIN storyboard_insight si on s.storyboardId = si.storyboardId
                        	LEFT Join insight i on i.insightId = si.insightId
                        	where personId = %s
                        order by storyboardId, `order`""", (personId,personId))
        storyboards = []
        storyboardIndex = -1
        for row in cur:
            if storyboardIndex == -1 or not storyboards[storyboardIndex]['storyboardId'] == row[0]:
                storyboardIndex += 1
                storyboards.append({
                    'storyboardId':row[0],
                    'storyboardName':row[1],
                    'insights':[]
                })
            if row[3] is None:
                storyboards[storyboardIndex]['insights'].append({
                    'connection':row[2]
                })
            else:
                storyboards[storyboardIndex]['insights'].append({
                    'insightId':  row[2],
                    'book': row[3],
                    'chapter': row[4],
                    'verses': row[5],
                    'rating': row[6],
                    'insight': row[7]
                })
    return storyboards

def authorize(token):
    with conn.cursor() as cur:
        cur.execute("select personId from person where sessionToken = %s",  (str(token)))
        for row in cur:
            return row[0]
        raise Exception('You my friend are unauthorized: ' + token + '!')


