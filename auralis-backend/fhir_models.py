from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime

class FHIRIdentifier(BaseModel):
    system: Optional[str] = None
    value: str

class FHIRCoding(BaseModel):
    system: Optional[str] = None
    code: str
    display: Optional[str] = None

class FHIRCodeableConcept(BaseModel):
    coding: List[FHIRCoding]
    text: Optional[str] = None

class FHIRQuantity(BaseModel):
    value: float
    unit: str
    system: Optional[str] = "http://unitsofmeasure.org"
    code: str

class FHIRPatient(BaseModel):
    resourceType: str = "Patient"
    id: Optional[str] = None
    identifier: List[FHIRIdentifier] = []
    active: bool = True
    name: List[dict] = []  # Simplified name structure
    gender: str
    birthDate: Optional[str] = None
    address: List[dict] = []
    telecom: List[dict] = []

class FHIRObservation(BaseModel):
    resourceType: str = "Observation"
    id: Optional[str] = None
    identifier: List[FHIRIdentifier] = []
    status: str = "final"
    category: List[FHIRCodeableConcept] = []
    code: FHIRCodeableConcept
    subject: dict  # Reference to Patient
    effectiveDateTime: datetime
    valueQuantity: Optional[FHIRQuantity] = None
    component: List[dict] = []  # For multi-value vitals like Blood Pressure

class FHIREncounter(BaseModel):
    resourceType: str = "Encounter"
    id: Optional[str] = None
    status: str
    class_: FHIRCoding = Field(..., alias="class")
    subject: dict
    period: Optional[dict] = None
    reasonCode: List[FHIRCodeableConcept] = []
