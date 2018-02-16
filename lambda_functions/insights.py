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
def login(event,context):
    with conn.cursor() as cur:
        cur.execute("select username, personId from person where username = %s and hash = %s", (event['body']['username'], str(
        hashlib.pbkdf2_hmac('sha256',event['body']['hash'].encode(),b'EFGC', 1))))
        for row in cur:
            new_token = create_new_token(row[0])
            cur.execute("update person set sessionToken = %s where personId = %s", (new_token, row[1]))
            return new_token
        raise Exception('You my friend are unauthorized')

def create_user(event,context):
    hash = str(hashlib.pbkdf2_hmac('sha256',event['body']['hash'].encode(),b'EFGC', 1))
    username = event['body']['username']
    new_token = create_new_token(username)
    with conn.cursor() as cur:
        cur.execute('INSERT INTO person (hash,username,sessionToken) VALUES(%s,%s,%s)',(hash,username,new_token))
        conn.commit()
        conn.close()
        return new_token

def create_new_token(personId):
    return hashlib.sha224((str(datetime.datetime.now()) + personId).encode()).hexdigest()

def get_user(event, context):
    person_id = authorize(event['headers']['Authorization'].split(' ')[1])
    with conn.cursor() as cur:
        cur.execute("select * from person where personid = %s" % (person_id))
        for row in cur:
            person = row[0]
    return person

def get_insights_by_id(event, context):
    params = {'personId':authorize(event['headers']['Authorization'].split(' ')[1])}
    results = []
    searchString = ''
    for term in event['queryParams']['search'].split(' '):
        searchString += " AND (tagname like %(" + term + ")s OR insight like %(" + term + ")s OR book like %(" + term + ")s) OR chapter like %(" + term + ")s OR rating like %(" + term + ")s OR verses like %(" + term + ")s"
        params[term] = '%' + term + '%'
    with conn.cursor() as cur:
        cur.execute("select i.insightId, book, chapter, verses, rating, insight from insight i left join tag_insight ti on ti.insightId = i.insightId left join tag t on t.tagid = ti.tagid  where personId = %(personId)s" + searchString, params)
        for row in cur:
            results.append({
                'insightId': row[0],
                'book':row[1],
                'chapter':row[2],
                'verses':row[3],
                'rating':row[4],
                'insight':row[5]
            })
    return results

def get_tags_by_id(event, context):
    params = {'personId':authorize(event['headers']['Authorization'].split(' ')[1])}
    results = []
    with conn.cursor() as cur:
        cur.execute("select tagname from insight i inner join tag_insight ti on ti.insightId = i.insightId inner join tag t on t.tagid = ti.tagid  where personId = %(personId)s", params)
        for row in cur:
            results.append(row[0])
    return results

def create_insight(event, context):
    event["personId"] = authorize(event['headers']['Authorization'])
    params = {}

    for param in ['personId','book','chapter','verses','insight','rating']:
        params[param]= event[param]

    with conn.cursor() as cur:
        cur.execute("INSERT INTO insight (book,chapter,verses,insight,rating, personId) VALUES (%(book)s, %(chapter)s, %(verses)s, %(insight)s, %(rating)s,%(personId)s)", params)
        conn.commit()
        for tag in event['tags']:
            cur.execute("INSERT INTO tag_insight (insight_id, tag_id) VALUES (%s,%s)", (cur.lastrowid,tag))
            conn.commit()






def authorize(token):
    with conn.cursor() as cur:
        cur.execute("select personId from person where sessionToken = %s",  (str(token)))
        for row in cur:
            return row[0]
        raise Exception('You my friend are unauthorized: ' + token + '!')
