#!python3
from django.core.management.utils import get_random_secret_key  

new_secret_key = get_random_secret_key()

fname = 'AUTHKEY/config.py'
data = new_secret_key

with open(fname, 'w') as f:
    f.write("SECRET_KEY = \'{}\'".format(data))
