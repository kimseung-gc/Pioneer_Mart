#!python3
from django.core.management.utils import get_random_secret_key  
import os

new_secret_key = get_random_secret_key()
AUTH_KEY_DIR = "./AUTHKEY/"

if not os.path.exists(AUTH_KEY_DIR):
    os.makedirs(AUTH_KEY_DIR)

fname = AUTH_KEY_DIR+'config.py'
data = new_secret_key

with open(fname, 'w') as f:
    f.write("SECRET_KEY = \'{}\'".format(data))
