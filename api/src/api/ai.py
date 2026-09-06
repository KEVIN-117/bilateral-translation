from typing import List
from pydantic import BaseModel

class KeypointsInput(BaseModel):
    sequence: List[List[float]]