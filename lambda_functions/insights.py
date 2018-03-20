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

def create_spider_board(event, context):
    personId = authorize(event['headers']['Authorization'].split(' ')[1])
    with conn.cursor() as cur:
        if 'spiderboardId' in  event['body']:
            spiderboardId = event['body']['spiderboardId']
            cur.execute('UPDATE spiderboard set spiderboardName = %s',(event['body']['spiderboardName']))
        else:
            cur.execute('INSERT INTO spiderboard (spiderboard) VALUES (%s)', (event["body"]['spiderboardName']))
            spiderboardId = cur.lastrowid

        insights = []
        connectionMap = {}
        for insight in event["body"]["insights"]:
            if insight < 0:
                cur.execute('INSERT INTO spiderboard_connection (spiderboardId, connection,top_position, left_position) VALUES ' + '(%s, %s,%s,%s)', (spiderboardId,insight['connection'],insight['top'],insight['left']))
                connectionMap[connection.tempId] = cur.lastrowid
            else:
                insights.extend([spiderboardId,insight['insightId'],insight['top'],insight['left']])

        if len(insight):
            cur.execute('INSERT INTO spiderboard_insight (spiderboardId, insightId, top_position, left_position) VALUES ' + ('(%s, %s,%s,%s),'* len(event["body"]["insights"]))[:-1],insights)


        lines = []
        for lines in event['body']['lines']:
            startingId = connectionMap[lines['startingInsight']['insightId']] if lines['startingInsight']['insightId'] < 0 else lines['startingInsight']['insightId']
            endingId = connectionMap[lines['endingInsight']['insightId']] if lines['endingInsight']['insightId'] < 0 else lines['endingInsight']['insightId']
            lines.extend([spiderboardId,startingId,endingId])
        cur.execute('INSERT INTO spiderboard_line (spiderboardId, startingInsightId, endingInsightId) VALUES '+ ('(%s, %s,%s),'* len(event["body"]["lines"]))[:-1],lines)
        conn.commit()

def get_spider_boards(event, context):
    personId = authorize(event['headers']['Authorization'].split(' ')[1])
    cur =  conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("""SELECT s.spiderboardId, spiderboardName, si.insightId,si.top_position,si.left_position, book, chapter, verses, insight, rating
                    FROM spiderboard s
                    INNER JOIN spider_insight si ON si.spiderboardId = s.spiderboardId
                    INNER JOIN insight i ON i.insightId = si.insightId
                    WHERE s.personId = %s""",(1))
    insights = cur.fetchall()
    if insights:
        cur.execute("""SELECT c.connectionId, c.connection, c.top_position, c.left_position
                        FROM spiderboard s
                        INNER JOIN spider_connection c ON c.spiderboardId = s.spiderboardId
                        WHERE s.personId = %s""", (1))
        insights.extend(cur.fetchall())
        cur.execute("""SELECT startingInsightId,endingInsightId
                        FROM spider_lines l
                        INNER JOIN spiderboard s on s.spiderboardId = l.spiderboardId
                        WHERE s.personId = %s""", (1))
        return {
            "spiderboardId":insights[0]["spiderboardId"],
            "spiderboardName":insights[0]["spiderboardName"],
            "insights":insights,
            "lines":cur.fetchall()
        }

def authorize(token):
    with conn.cursor() as cur:
        cur.execute("select personId from person where sessionToken = %s",  (str(token)))
        for row in cur:
            return row[0]
        raise Exception('You my friend are unauthorized: ' + token + '!')
