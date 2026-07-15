"""Additional confirmed Storm & Me / Will Scott books."""


def amazon_cover(asin: str) -> str:
    return f"https://images-na.ssl-images-amazon.com/images/P/{asin}.01.LZZZZZZZ.jpg"


BOOKS = [
    {
        "id": "what-if-they-are-real",
        "title": "What If They Are Real?",
        "subtitle": "A journey into the possibility that we are not alone",
        "category": "Science Fiction",
        "categories": ["Science Fiction"],
        "price": 0.0,
        "formats": ["Amazon"],
        "cover": amazon_cover("B0H295Q9BT"),
        "summary": "A thought-provoking exploration of the possibility that the strange stories, sightings, and mysteries may be pointing to something real.",
        "description": "What If They Are Real? invites readers to step beyond easy answers and consider the mystery of what may exist beyond the world we know.",
        "author_note": "Sometimes the biggest questions begin with two simple words: what if? — Will Scott",
        "amazon_link": "https://www.amazon.com/What-If-They-Are-Real/dp/B0H295Q9BT",
        "trailer_url": "",
        "status": "available",
        "reviews": [],
        "related": ["abductee-chronicles-marcus", "last-block-book-one"],
    }
]
