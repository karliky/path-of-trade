import cv2
import numpy as np

# read image as grayscale
img = cv2.imread('diablo2images\\images\\test\\shako-black.png')

# convert to grayscale
gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

# threshold
_,thresh = cv2.threshold(gray,0,255,cv2.THRESH_BINARY)

# apply close to connect the white areas
kernel = np.ones((75,75), np.uint8)
thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

# get contours (presumably just one around the outside) 
result = img.copy()
contours = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
contours = contours[0] if len(contours) == 2 else contours[1]
for cntr in contours:
    x,y,w,h = cv2.boundingRect(cntr)
    cv2.rectangle(result, (x, y), (x+w, y+h), (0, 0, 255), 2)

# show thresh and result    
cv2.imshow("thresh", thresh)
cv2.imshow("Bounding Box", result)
cv2.waitKey(0)
cv2.destroyAllWindows()

# save resulting images
cv2.imwrite('blackbox_thresh.png',thresh)
cv2.imwrite('diablo2images\\images\\test\\shako-result.png',result)