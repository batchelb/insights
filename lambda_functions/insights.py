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

def delete_story_board(event, context):
    authorize(event['headers']['Authorization'].split(' ')[1])
    with conn.cursor() as cur:
        cur.execute('DELETE FROM storyboard where storyboardId = %s', (event["body"]["storyboardId"]))
        conn.commit()

def authorize(token):
    with conn.cursor() as cur:
        cur.execute("select personId from person where sessionToken = %s",  (str(token)))
        for row in cur:
            return row[0]
        raise Exception('You my friend are unauthorized: ' + token + '!')


