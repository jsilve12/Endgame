"""
Abstract library for processing elo results (v2)

"""

# TODO:
# Get date related functionality working
# Get DB working

import math
import psycopg2
import psycopg2.extras
from datetime import date
from configparser import ConfigParser

def parseDB(filename='db.config', section='postgresql'):
    """ Create a connection to a database

    Args:
        filename (string): The file containing the credentials
        section (string): The section in the file

    Returns:
        The arguments for initializing a pyscopg2 database
    """
    parser = ConfigParser()
    parser.read(filename)

    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception(f'Section {section} not found')
    return db

def get_cursor():
    """ Gets a Cursor"""
    conn = psycopg2.connect(**parseDB('/app/configs/db.config'))
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    return cur

def use_cursor(cursor, query, args=()):
    """ Executes and fetches the results of a query

    args:
        cursor (Cursor)
        query (string): The query being run
        args (tuple): The cursor argument
    """
    try:
        cursor.execute(query, args)
        return cursor.fetchall()
    except:
        return None
