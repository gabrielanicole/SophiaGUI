import datetime


##@brief Function to add a new offset "bucket" to histogram.
##@param previous 
##@param granularity
##@return new Bucket as JSON.
def addBucket(previous, granularity):
   
    if (granularity == "minute"):
        key = previous['key']+60000
        key_as_string = datetime.datetime.fromtimestamp(key/1000).strftime('%Y-%m-%d %H:%M:%S')

    elif (granularity == 'hour'):
        key = previous['key']+3600000
        key_as_string = datetime.datetime.fromtimestamp(key/1000).strftime('%Y-%m-%d %H:%M:%S')

    elif (granularity == 'day'):
        key = previous['key']+86400000
        key_as_string = datetime.datetime.fromtimestamp(key/1000).strftime('%Y-%m-%d %H:%M:%S')
    
    elif (granularity == "week"):
        key = previous['key']+604800000
        key_as_string = datetime.datetime.fromtimestamp(key/1000).strftime('%Y-%m-%d %H:%M:%S')

    elif (granularity == "month"):
        key = previous['key']+2629746000+86400000
        key_as_string = datetime.datetime.fromtimestamp(key/1000).strftime('%Y-%m-%d %H:%M:%S')

    else:
        key = previous['key']+31556952000+86400000
        key_as_string = datetime.datetime.fromtimestamp(key/1000).strftime('%Y-%m-%d %H:%M:%S')
        
    bucket = {
            'key': key,
            'key_as_string': key_as_string,
            'doc_count':0
    }
   
    return bucket


