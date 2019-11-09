from cx_Freeze import setup, Executable

base = None    

executables = [Executable("find-contour.py", base=base)]

packages = ["cv2", "argparse", "numpy"]
options = {
    'build_exe': {    
        'packages':packages,
    },    
}

setup(
    name = "Find Contour",
    options = options,
    version = "1.0",
    description = 'Diablo 2 Item Finder',
    executables = executables
)