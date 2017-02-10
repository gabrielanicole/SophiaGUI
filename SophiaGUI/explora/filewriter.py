import cStringIO
import csv
import simplejson as json
import unicodedata
from django.shortcuts import HttpResponse

def return_json_file(data):
    r = {
        "data":data
        }

    content = json.dumps(r)
    file = cStringIO.StringIO(content)
    response = HttpResponse(file, content_type='text/json')
    response['File-Name'] = "exportdata.json"
    response['Content-Disposition'] = 'attachment; filename="exportdata.json"'
    return response

def return_csv_file(data):
    my_file = cStringIO.StringIO();
    writer = csv.writer(my_file)
    for x in data:
        e = []
        for key,value in x.items():
            e.append(x[key].encode('utf8'))
        writer.writerow(e)

    response = HttpResponse(my_file.getvalue(), content_type='text/csv')
    response['File-Name'] = "exportdata.csv"
    response['Content-Disposition'] = 'attachment; filename="exportdata.csv"'
    return response

def return_csv_text_file(data):
    my_file = cStringIO.StringIO();
    writer = csv.writer(my_file)
    for x in data:
        e = []
        for key,value in x.items():
            e.append(x[key].encode('utf8'))
        writer.writerow(e)

    response = HttpResponse(my_file.getvalue(), content_type='text/plain')
    response['File-Name'] = "exportdata.txt"
    response['Content-Disposition'] = 'attachment; filename="exportdata.txt"'
    return response    