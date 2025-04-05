from flask import Flask, request
from flasgger import Swagger
from flask_cors import CORS  # Import CORS from flask_cors
import pandas as pd
import numpy as np  
import nltk
import pickle 
import re
from nltk.corpus import stopwords
nltk.download('stopwords')
nltk.download('wordnet')
wnlem = nltk.WordNetLemmatizer()
nltk.download('punkt')

with open(r'..\ClassificationModel\svm_model.pkl','rb') as model_classifierSVM_file:
    classifier = pickle.load(model_classifierSVM_file)

with open(r'..\ClassificationModel\bagofwordsmodel.pkl','rb') as model_BOW_file:
    cv = pickle.load(model_BOW_file)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes in the Flask app
swagger = Swagger(app)

@app.route('/predict', methods=["GET"])
def Analyse_Section_IPC():
    """Example endpoint returning a prediction of IPC SECTION
    ---
    parameters:
      - name: IPC_Section_Text
        in: query
        type: string
        required: true
    definitions:
        value:
            type: object
            properties:
                value_name:
                    type: string
                    items:
                        $ref: '#/definitions/Color'
        Color:
            type: string
    responses:
        200:
            description: OK
            schema:
                $ref: '#/definitions/value'     
    """
    text = request.args.get("IPC_Section_Text")
    temp = []
    all_stopwords = stopwords.words('english')

    text_sent = nltk.sent_tokenize(text)

    for sentence in text_sent:
        new_sentence = re.sub('[^a-zA-Z]', ' ', sentence)
        new_sentence = new_sentence.lower()
        new_sentence = new_sentence.split()
        new_sentence = [wnlem.lemmatize(word) for word in new_sentence if not word in set(all_stopwords)]
        print(sentence)
        new_sentence = ' '.join(new_sentence)
        print(new_sentence)
        new_corpus = [new_sentence]
        new_X_test = cv.transform(new_corpus).toarray()
        new_y_pred = classifier.predict(new_X_test)
        print(new_y_pred)
        temp.append([sentence, new_y_pred])
    
    return str(temp)

@app.route('/predict_file', methods=["POST"])
def Analyse_Section_IPC_file():
    """Example file endpoint returning a prediction of IPC SECTION
    ---
    parameters:
      - name: file
        in: formData
        type: file
        required: true
    definitions:
        value:
            type: object
            properties:
                value_name:
                    type: string
                    items:
                        $ref: '#/definitions/Color'
        Color:
            type: string
    responses:
        200:
            description: OK
            schema:
                $ref: '#/definitions/value'   
    """
    file = request.files['file']
    
    FIND_IPC_SECTION = file.read()
    text = str(FIND_IPC_SECTION)
    temp = []
    all_stopwords = stopwords.words('english')

    text_sent = nltk.sent_tokenize(text)

    for sentence in text_sent:
        new_sentence = re.sub('[^a-zA-Z]', ' ', sentence)
        new_sentence = new_sentence.lower()
        new_sentence = new_sentence.split()
        new_sentence = [wnlem.lemmatize(word) for word in new_sentence if not word in set(all_stopwords)]
        print(sentence)
        new_sentence = ' '.join(new_sentence)
        print(new_sentence)
        new_corpus = [new_sentence]
        new_X_test = cv.transform(new_corpus).toarray()
        new_y_pred = classifier.predict(new_X_test)
        print(new_y_pred)
        temp.append([sentence, new_y_pred])
    
    return str(temp)

if __name__ == '__main__':
    app.run()