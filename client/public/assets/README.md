Place your left-side illustration image here so it is served statically.

Filename expected by the app: `left-illustration.jpg` (JPG format).

To add your image:

**Option 1: Copy from your Downloads (Easiest)**
```bash
# From your terminal, navigate to your project root, then:
cp ~/Downloads/left-illustration.jpg client/public/assets/left-illustration.jpg

# Verify the file was copied:
ls -lh client/public/assets/left-illustration.jpg

# Commit the change:
cd client
git add public/assets/left-illustration.jpg
git commit -m "Add left illustration for login page"
```

**Option 2: Use Finder/File Explorer**
1. Open Finder and navigate to: `client/public/assets/`
2. Drag your JPG file into this folder
3. Rename it to `left-illustration.jpg` if needed
4. In terminal, run:
   ```bash
   cd client
   git add public/assets/left-illustration.jpg
   git commit -m "Add left illustration for login page"
   ```

Once the file is in place, restart your dev server and the image will appear on the login page.

