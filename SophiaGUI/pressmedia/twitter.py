# -*- coding: utf-8 -*-
import tweepy
import time
import requests
import simplejson as json


def addFriend(api,screen_name):
    #this function add a friend to follow
    try:
        api.create_friendship(screen_name)
        return '200'
    except Exception as e:
        print e
        return '108'

def removeFriend(api,screen_name):
    #this function remove a friend to unfollow
    try:
        api.destroy_friendship(screen_name)
    except:
        pass

def saveFriendsInSophia(api):
    followeds = api.friends_ids('MMChileResearch')
    for i in range(len(followeds)):
        doc = {}
        print i
        print followeds[i]
        user = api.get_user(followeds[i])
        print user.name
        doc['pre_name'] = user.name
        print user.screen_name
        doc['pre_owner'] = 'NO INFORMADO'
        doc['pre_region'] = 'NO INFORMADO'
        print user.created_at
        doc['pre_date'] = str(user.created_at)
        doc['pre_twitter'] = user.screen_name
        doc['pre_facebook'] = 'NO INFORMADO'
        doc['pre_url'] = 'NO INFORMADO'
        doc['pre_language'] = 'Español'

        try:
            location = user.profile_location['full_name']
            print user.profile_location['full_name']
            array = location.split(',')
            doc['pre_city'] = array[0]
            doc['pre_country'] = array[1].strip()
        except:
            doc['pre_city'] = 'NO INFORMADO'
            doc['pre_country'] = 'Chile'

        print requests.post('http://api.sophia-project.info/v2/pressmedia/',data=json.dumps(doc))
        #print requests.post('http://localhost:8000/v2/pressmedia/',data=json.dumps(doc))
        #try:
        #    api.create_friendship(followeds[i])
        #except:
        #    pass
    print 'end of backup followeds'
#addFriend(api,'Cooperativa')

def main():
    #credenciales de sophiaproject4
    consumer_key = 'wHpPsl5nuZXEyJU6fgqPzvs3V'
    consumer_secret = 'zqDiIsAMGaCvuQpwYFZCawLGjRWHH9UNW6iPq9lXdY3PEvmYTk'
    access_token = '822060303907176448-YYFVabdPAF8Fw8JbB7bM2out2RUFTvn'
    access_token_secret = 'ctFi2JCDuI80e6lYCZDzKu3OYTBhvzAXeS1bCfO7aKMtn'

    #credenciales en produccion
    #consumer_key = 'ac1yMlhXpxDAjzJWwmzagg'
    #consumer_secret = 'wpMMIXxkZ3ChqANkdVkzMH0wMdb8nKMqIVaztIEwtw'
    #access_token = '2177040169-5aVazrfgCpjhDOgemcIw1PvZXb3nbHtglUuAOcf'
    #access_token_secret = 'iCVFeVZkhSC3hsJfISbLDbpZZAyUS2Grn6ZJUNABaWmrt'

    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)

    api = tweepy.API(auth)

    saveFriendsInSophia(api)

if __name__ == "__main__":
    main()
