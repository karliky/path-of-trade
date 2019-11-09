import cv2 as cv
import argparse
import numpy as np
max_binary_value = 255

def Threshold_Demo(inputPath, outputPath):
    #1: Binary Inverted
    threshold_type = 1
    threshold_value = 0
    _, dst = cv.threshold(src_gray, threshold_value, max_binary_value, threshold_type )
    outputResultPath = outputPath + 'result-threshold.png'
    cv.imwrite(outputResultPath, dst)
    return outputResultPath

def ROIExtractor(inputPath, outputPath):
  # Read image as grayscale; threshold to get rid of artifacts
  _, img = cv.threshold(cv.imread(inputPath, cv.IMREAD_GRAYSCALE), 0, 255, cv.THRESH_BINARY)

  # Get indices of all non-zero elements
  nz = np.nonzero(img)

  # Find minimum and maximum x and y indices
  top = np.min(nz[0])
  bottom = np.max(nz[0])
  left = np.min(nz[1])
  right = np.max(nz[1])

  # Create some output
  output = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
  cv.rectangle(output, (left, top), (right, bottom), (0, 0, 255), 2)

  width = right - left
  height = bottom - top

  print('{', '"top":', top, ',"width":', width, ',"left":', left, ',"height":', height, '}')
  # Show results
  cv.imwrite(outputPath + 'roi-extracted.png', output)

parser = argparse.ArgumentParser(description='Diablo 2 Item Finder')
parser.add_argument('--input', help='Path to input image.', default='')
parser.add_argument('--output', help='Output folder.', default='')
args = parser.parse_args()
src = cv.imread(cv.samples.findFile(args.input))
if src is None:
    print('Could not open or find the image: ', args.input)
    exit(5)
# Convert the image to Gray
src_gray = cv.cvtColor(src, cv.COLOR_BGR2GRAY)
resultPath = Threshold_Demo(args.input, args.output)
ROIExtractor(resultPath, args.output)