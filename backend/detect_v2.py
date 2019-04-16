import keras.models
import cv2
import numpy as np

import backend.digit_detector.region_proposal as rp
import backend.digit_detector.show as show
import backend.digit_detector.detect as detector
import backend.digit_detector.preprocess as preproc
import backend.digit_detector.classify as cls

detect_model = 'backend/model/detector_model.hdf5'
recognize_model = 'backend/model/recognize_model.hdf5'

mean_value_for_detector = 107.524
mean_value_for_recognizer = 112.833

model_input_shape = (32,32,1)
DIR = 'backend/tests/imgs/temp.jpg'

def predict():

    # pre-process
    preproc_for_detector = preproc.GrayImgPreprocessor(mean_value_for_detector)
    preproc_for_recognizer = preproc.GrayImgPreprocessor(mean_value_for_recognizer)

    # get classifier tools 
    char_detector = cls.CnnClassifier(detect_model, preproc_for_detector, model_input_shape)
    char_recognizer = cls.CnnClassifier(recognize_model, preproc_for_recognizer, model_input_shape)

    digit_spotter = detector.DigitSpotter(char_detector, char_recognizer, rp.MserRegionProposer())

    img = cv2.imread(DIR)
    # predict
    pred = digit_spotter.run(img, threshold=0.5, do_nms=True, nms_threshold=0.1)
    return pred
