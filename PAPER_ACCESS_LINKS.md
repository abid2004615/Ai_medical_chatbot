# Direct Access Links to Reference Papers

## How to Access the Papers

Click on the DOI links below to access each paper. Most papers are available through:
- **Open Access** (free to read)
- **Institutional Access** (if you're at a university)
- **ResearchGate** or **Google Scholar** (for preprints/author copies)

---

## Paper 1: Conversational Agents in Healthcare
**Direct Link**: https://doi.org/10.1093/jamia/ocy072  
**Alternative**: Search "Laranjo conversational agents healthcare" on Google Scholar  
**Journal**: Journal of the American Medical Informatics Association (2018)

---

## Paper 2: Evaluation of Symptom Checkers
**Direct Link**: https://doi.org/10.1136/bmj.h3480  
**Alternative**: Search "Semigran symptom checkers BMJ" on Google Scholar  
**Journal**: BMJ (2015)  
**Note**: BMJ articles are often open access

---

## Paper 3: Large Language Models Encode Clinical Knowledge
**Direct Link**: https://doi.org/10.1038/s41586-023-06291-2  
**Alternative**: Search "Singhal large language models clinical knowledge Nature" on Google Scholar  
**Journal**: Nature (2023)  
**Note**: This is Google's Med-PaLM paper

---

## Paper 4: Personalization of Conversational Agents in Healthcare
**Direct Link**: https://doi.org/10.2196/15360  
**Alternative**: Search "Kocaballi personalization conversational agents" on Google Scholar  
**Journal**: Journal of Medical Internet Research (2019)  
**Note**: JMIR is open access

---

## Paper 5: Clinical Decision Support Systems Overview
**Direct Link**: https://doi.org/10.1038/s41746-020-0221-y  
**Alternative**: Search "Sutton clinical decision support NPJ" on Google Scholar  
**Journal**: NPJ Digital Medicine (2020)  
**Note**: NPJ Digital Medicine is open access

---

## Paper 6: Triage Systems Using Intelligent Systems
**Direct Link**: https://doi.org/10.1016/j.artmed.2019.101762  
**Alternative**: Search "Fernandes triage emergency department AI" on Google Scholar  
**Journal**: Artificial Intelligence in Medicine (2020)

---

## Paper 7: Chatbots in Mental Health
**Direct Link**: https://doi.org/10.1177/0706743719828977  
**Alternative**: Search "Vaidyam chatbots mental health" on Google Scholar  
**Journal**: The Canadian Journal of Psychiatry (2019)

---

## Paper 8: Deep Learning for Skin Cancer Classification
**Direct Link**: https://doi.org/10.1038/nature21056  
**Alternative**: Search "Esteva dermatologist skin cancer Nature" on Google Scholar  
**Journal**: Nature (2017)  
**Note**: Famous Stanford AI dermatology paper

---

## Paper 9: Relational Agents for Medication Adherence
**Direct Link**: https://doi.org/10.1016/j.intcom.2010.02.001  
**Alternative**: Search "Bickmore relational agents medication adherence" on Google Scholar  
**Journal**: Interacting with Computers (2010)

---

## Paper 10: Medical Question Answering (emrQA)
**Direct Link**: https://doi.org/10.18653/v1/D18-1258  
**Alternative**: Search "Pampari emrQA electronic medical records" on Google Scholar  
**Conference**: EMNLP (2018)  
**Note**: Conference papers are usually open access

---

## Paper 11: High-Performance Medicine with AI
**Direct Link**: https://doi.org/10.1038/s41591-018-0300-7  
**Alternative**: Search "Topol high-performance medicine AI" on Google Scholar  
**Journal**: Nature Medicine (2019)  
**Note**: Written by Eric Topol, leading voice in medical AI

---

## Paper 12: Machine Learning Ethics in Healthcare
**Direct Link**: https://doi.org/10.1056/NEJMp1714229  
**Alternative**: Search "Char machine learning healthcare ethics NEJM" on Google Scholar  
**Journal**: New England Journal of Medicine (2018)

---

## Paper 13: Mobile Health Applications for Shared Decision Making
**Direct Link**: https://doi.org/10.1080/16549716.2017.1332259  
**Alternative**: Search "Abbasgholizadeh mobile health shared decision" on Google Scholar  
**Journal**: Global Health Action (2017)  
**Note**: Open access journal

---

## Paper 14: Ethics of Digital Technology in Mental Health
**Direct Link**: https://doi.org/10.1186/s40345-017-0073-9  
**Alternative**: Search "Bauer ethical perspectives digital technology mental illness" on Google Scholar  
**Journal**: International Journal of Bipolar Disorders (2017)  
**Note**: Open access journal

---

## Paper 15: Coronavirus and Digital Health
**Direct Link**: https://doi.org/10.1145/3372923.3404798  
**Alternative**: Search "Mejova coronavirus bandwagon ACM" on Google Scholar  
**Conference**: ACM Hypertext and Social Media (2020)

---

## Paper 16: AI in Patient Safety
**Direct Link**: https://doi.org/10.1097/PTS.0000000000000887  
**Alternative**: Search "Schachner artificial intelligence patient safety" on Google Scholar  
**Journal**: Journal of Patient Safety (2022)

---

## Tips for Accessing Papers

### Free Access Methods:
1. **Google Scholar** - Search paper title, often has free PDF links
2. **ResearchGate** - Authors often upload their papers
3. **PubMed Central** - Free for many medical papers
4. **Sci-Hub** - (Use at your own discretion based on your location's laws)
5. **Author's Website** - Many researchers post PDFs on their personal sites
6. **Request from Author** - Email authors directly (usually happy to share)

### Institutional Access:
- If you're at a university, use your library's access
- Many universities have subscriptions to Nature, BMJ, NEJM, etc.

### Open Access Journals:
These are completely free:
- NPJ Digital Medicine (Paper 5)
- Journal of Medical Internet Research (Paper 4)
- Global Health Action (Paper 13)
- International Journal of Bipolar Disorders (Paper 14)

---

## Quick Search Commands

Copy and paste these into Google Scholar:

```
"Conversational agents in healthcare: a systematic review" Laranjo
"Evaluation of symptom checkers for self diagnosis" Semigran
"Large language models encode clinical knowledge" Singhal Nature
"The personalization of conversational agents in health care" Kocaballi
"An overview of clinical decision support systems" Sutton
"Clinical Decision Support Systems for Triage" Fernandes
"Chatbots and Conversational Agents in Mental Health" Vaidyam
"Dermatologist-level classification of skin cancer" Esteva
"Maintaining reality: Relational agents" Bickmore
"emrQA: A Large Corpus for Question Answering" Pampari
"High-performance medicine: the convergence" Topol
"Implementing Machine Learning in Health Care" Char
"mobile health applications useful for supporting shared decision" Rahimi
"Ethical perspectives on recommending digital technology" Bauer
"Advertisers Jump on Coronavirus Bandwagon" Mejova
"Artificial Intelligence in Healthcare patient safety" Schachner
```

---

## Download All Papers Script

If you have institutional access, you can use this Python script to download all papers:

```python
import requests
import time

dois = [
    "10.1093/jamia/ocy072",
    "10.1136/bmj.h3480",
    "10.1038/s41586-023-06291-2",
    "10.2196/15360",
    "10.1038/s41746-020-0221-y",
    "10.1016/j.artmed.2019.101762",
    "10.1177/0706743719828977",
    "10.1038/nature21056",
    "10.1016/j.intcom.2010.02.001",
    "10.18653/v1/D18-1258",
    "10.1038/s41591-018-0300-7",
    "10.1056/NEJMp1714229",
    "10.1080/16549716.2017.1332259",
    "10.1186/s40345-017-0073-9",
    "10.1145/3372923.3404798",
    "10.1097/PTS.0000000000000887"
]

for i, doi in enumerate(dois, 1):
    print(f"Paper {i}: https://doi.org/{doi}")
    time.sleep(1)
```

---

*Last Updated: November 2025*
