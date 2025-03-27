from basic_classes.User_example import Request, User

def testRequests():
    """
    An example test of an example class Requests within an example file User
    """
    RQ_sample = Request ("ks1234", "name", "desc", ".", "ks5923")
    # assert RQ_sample.call_time_stamp() is "<time>"
    User_ex = User ("sk5923", "hello world!", "alpha@grinnell.edu")
    assert User_ex.grin_email() is "alpha@grinnell.edu"
    assert User_ex.account_blocked is False
    assert User_ex.rating is "UND"

"""
$ pytest
tests the assertions in the test file
$ mypy src
tests the issues regarding the function castings and unlinked object types
$ flake8 src
tests the formatting issues regarding the object types
"""
