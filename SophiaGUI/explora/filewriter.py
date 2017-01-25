import cStringIO
import csv
import simplejson as json
import unicodedata

def return_json_file(data):
    r = {
        "data":data
        }
    content = json.dumps(data)
    file = cStringIO.StringIO(content)
    return file

def return_csv_file(data):
    my_file = cStringIO.StringIO();
    writer = csv.writer(my_file)
    for x in data:
        writer.writerow(x['art_title'].encode('utf8','ignore'))
    return my_file