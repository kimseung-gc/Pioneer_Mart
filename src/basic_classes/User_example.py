import datetime
import typing


class Request:
    """
    Request helper class for User class. For special requests,
    extend this class, and create special functionalities.

    Attribute
    ---------
    ID : str
        the users' ID (might be hash)
    name_of_product : str
        the name of the product
    description : str
        the description of the uploaded product
    photo_dirs : typing.List[str]
        photo directories
    requester_ID : str
        requester's user ID
    """
    def __init__(self, ID: str, name_of_product: str, description: str, photo_dirs: typing.List[str], requester_ID: str):
        """
        Initiates all the variables.

        Parameters
        ----------
        ID : str
            the users' ID
        name_of_product : str
            the name of the product
        description : str
            the description of the product
        photo_dirs : typing.List[str]
            the list
        requester_ID : str
        """
        self.ID = ID
        self.name_of_product = name_of_product
        self.description = description
        self.photos = photo_dirs
        self.requester_ID = requester_ID
        self.time_stamp = datetime.datetime.now()

    def call_time_stamp(self):
        return self.time_stamp


class User:
    """
    Base class for all users. For special users,
    please extend this class, and create special functionalities.

    Attributes
    ----------
    ID : str
        the users' ID (might be hash)
    password : str
        the users' password
    grin_email : str
        Grinnell College-provided email
    rating : str/float
        Depending on whether the rating is defined or undefined, the type might be different.
    ongoing_requests : dictionary
        dictionary of ongoing requests. Value of the dictionary is of "Request" class.
    completed_requests : dictionary
        dictionary of completed requests. Uses the same request ID as "ongoing_requests"
    account_blocked : boolean
        Indicates whether the account is blocked, and is not accessible or not.
    """
    def __init__(self, ID: str, password: str, email: str):
        """
        defines all the required variables (you are able to reset the users' data with this, so be careful)

        Parameters
        ----------
        ID : str
            user ID as a string (preferably hash)
        password : str
            the users' password
        grin_email : str
            the users' Grinnell College-provided email
        """
        self.ID = ID
        self.password = password
        self.email = email
        self.rating = "UND"
        self.ongoing_requests: typing.Dict[str, Request] = dict()
        self.completed_requests: typing.Dict[str, Request] = dict()
        self.account_blocked = False

    def grin_email(self):
        """

        """
        return self.email

    def call_most_recent_request(self):
        temp = list(self.ongoing_requests.items())[0][1].call_time_stamp().time()
        most_recent_req = list(self.ongoing_requests.items())[0][1]
        for _, value in self.ongoing_requests.items():
            temp2 = value.call_time_stamp().time()
            if temp < temp2:
                temp = temp2
                most_recent_req = value
        return most_recent_req

    def complete_request(self, ID):
        temp = self.ongoing_requests
        tempItem = temp[ID]
        del temp[ID]
        self.ongoing_requests = temp
        self.completed_requests[ID] = tempItem

    def call_request(self, ID):
        try:
            return self.ongoing_requests[ID]
        except KeyError:
            try:
                return self.completed_requests[ID]
            except KeyError:
                raise KeyError("Key {ID} not found")

    def add_request(self, req: Request):
        ID = ""
        self.ongoing_requests[ID] = req
