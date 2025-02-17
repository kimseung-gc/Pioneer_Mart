import datetime

class Request:
    def __init__(self, ID, name_of_product, description, photo_dirs, requester_ID):
        self.ID = ID
        self.name_of_product = name_of_product
        self.description = description
        self.photo = photo_dirs
        self.requester_ID = requester_ID
        self.time_stamp = datetime.datetime.now()
    def call_time_stamp(self):
        return self.time_stamp