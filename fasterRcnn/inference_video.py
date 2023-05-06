import numpy as np
import cv2
import torch
import glob as glob
import os
import time
import argparse
import yaml
import matplotlib.pyplot as plt
import json

from models.create_fasterrcnn_model import create_model
from utils.general import set_infer_dir
from utils.annotations import inference_annotations, annotate_fps
from utils.transforms import infer_transforms
from torchvision import transforms as transforms

def read_return_video_data(video_path):
    cap = cv2.VideoCapture(video_path)
    #Get the video's frame width and height
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    assert (frame_width != 0 and frame_height !=0), 'Please check video path...'
    return cap, frame_width, frame_height

def parse_opt():
    #I remove most of unuse arg since there is 
    #really one which is inputVideo to pass as backend arg
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-i', '--input',
        default=None,
        help='path to input video',
    )
    args = vars(parser.parse_args())
    return args

def main(args):

    DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    

    #state dict have all train log including some config file
    #and trained weights which are not in structure need to 
    #load into architecture later
    checkpoint = torch.load("outputs/training/fasterrcnn_resnet50_fpn_v2_sense/best_model.pth", map_location=DEVICE)
    NUM_CLASSES = checkpoint['config']['NC']
    CLASSES = checkpoint['config']['CLASSES']

    #model is from pytorch official 
    #to print some networking problem
    try:  
      print('Building from model name arguments...')
      build_model = create_model[checkpoint['model_name']]
    except Exception as e:
      traceback.print_exc()
      print(str(e))
    
    #load structure and put trained weight into it via load_state_dict
    model = build_model(num_classes=NUM_CLASSES, coco_model=False)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(DEVICE).eval() #turn off gradient track
    
    # Dist of occour class and it's corrospond time 
    CLSDICT = {cls :set() for cls in CLASSES}
    TIMDICT = {cls :list() for cls in CLASSES}

    #box color
    np.random.seed(42) 
    COLORS = np.random.uniform(0, 255, size=(len(CLASSES), 3))

    #it's is what it's :p
    VIDEO_PATH = args['input']
    assert VIDEO_PATH is not None, 'Please provide path to an input video...'
    detection_threshold = .9

    #config opencv
    cap, frame_width, frame_height = read_return_video_data(VIDEO_PATH)
    save_name = VIDEO_PATH.split(os.path.sep)[-1].split('.')[0]
    print(save_name)
    out = cv2.VideoWriter(f"{'../server/video/output'}/{save_name}.mp4", cv2.VideoWriter_fourcc(*'mp4v'), 30, (frame_width, frame_height))
    RESIZE_TO = (frame_width, frame_height)
    frame_count = 0 # To count total frames.
    total_fps = 0 # To get the final frames per second.
    cv_fps = cap.get(5)

    #read until end of video
    while(cap.isOpened()):
        #capture each frame of the video
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, RESIZE_TO)
            image = frame.copy()
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = infer_transforms(image)
            #Add batch dimension.
            image = torch.unsqueeze(image, 0)
            #Get the start time.
            start_time = time.time()
            with torch.no_grad():
                # Get predictions for the current frame.
                outputs = model(image.to(DEVICE))
            forward_end_time = time.time()

            forward_pass_time = forward_end_time - start_time
            
            #detection fps
            fps = 1 / (forward_pass_time)
            total_fps += fps

            frame_count += 1

            outputs = [{k: v.to('cpu') for k, v in t.items()} for t in outputs]
            #draw box if there detected object
            if len(outputs[0]['boxes']) != 0:
                frame,PC = inference_annotations(
                    outputs, detection_threshold, CLASSES,
                    COLORS, frame)
                #unpack pred_classes and make into set object
                oc = {*PC}
                for cls in oc:
                  # add time
                  CLSDICT[cls].add(int(frame_count/cv_fps))
                # print(f"detected {oc} at {frame_count/cv_fps}")
                
            frame = annotate_fps(frame, fps)

            final_end_time = time.time()
            forward_and_annot_time = final_end_time - start_time

            # print_string = f"Frame: {frame_count}, Forward pass FPS: {fps:.3f}, "
            # print_string += f"Forward pass time: {forward_pass_time:.3f} seconds, "
            # print_string += f"Forward pass + annotation time: {forward_and_annot_time:.3f} seconds"
            # print(print_string)

            out.write(frame)
        else:
            break
    #occour classes and their timeline
    for key in CLSDICT:
      pre = -1
      for now in CLSDICT[key]:
        if now-1 != pre and pre !=-1 or now ==1:
          #new timeline
          TIMDICT[key].append([now,now])
        if now-1 == pre and pre !=-1 :
          #countinus timeline
          TIMDICT[key][-1][-1]=now
        pre =now
      print(f"{key} detected at {TIMDICT[key]}")

    #Release VideoCapture().
    cap.release()

    #write timeline json for front end
    TIMDICT.pop('__background__')
    json_data = json.dumps(TIMDICT)
    with open(f"{'../server/video/output'}/{save_name}.json", 'w') as f:
      f.write(json_data)
    
    #close all frames and video windows 
    #and print avg process time
    cv2.destroyAllWindows()
    avg_fps = total_fps / frame_count
    print(f"Average FPS: {avg_fps:.3f}")

if __name__ == '__main__':
    args = parse_opt()
    main(args)
