package com.example.springapp.services;

import org.springframework.stereotype.Service;
import java.io.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.apache.commons.io.IOUtils;
import java.nio.charset.StandardCharsets;

@Service
public class UnitConversionService {

    public Map<String, Object> convertUnits(double quantity, String fromUnit, String toUnit) throws IOException, InterruptedException {
        try {
            // Adjust the path to your script
            ClassPathResource resource = new ClassPathResource(".venv/unit_converter.py");

            File tempScript = File.createTempFile("unit_converter", ".py");
            try (FileOutputStream out = new FileOutputStream(tempScript)) {
                IOUtils.copy(resource.getInputStream(), out);
            }

            tempScript.setExecutable(true);

            // Get the path to the python executable within the virtual environment
            String pythonExecutable = ".venv/Scripts/python"; // Adjust for your OS (Scripts on Windows, bin on Linux/macOS)
            if (System.getProperty("os.name").toLowerCase().contains("nix") || System.getProperty("os.name").toLowerCase().contains("mac")) {
                pythonExecutable = ".venv/bin/python";
            }

            ProcessBuilder processBuilder = new ProcessBuilder(pythonExecutable, tempScript.getAbsolutePath(),
                    String.format("{\"quantity\": %f, \"from_unit\": \"%s\", \"to_unit\": \"%s\"}", quantity, fromUnit, toUnit));

            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8));
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8));

            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            StringBuilder errorOutput = new StringBuilder();
            String errorLine;
            while ((errorLine = errorReader.readLine()) != null) {
                errorOutput.append(errorLine).append("\n");
            }

            int exitCode = process.waitFor();

            if (exitCode != 0 || errorOutput.length() > 0) {
                System.err.println("Python script execution failed. Exit code: " + exitCode);
                System.err.println("Error output:\n" + errorOutput.toString());
                throw new IOException("Python script execution failed. Exit code: " + exitCode + " Error message: " + errorOutput.toString());
            }

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(output.toString(), Map.class);
        } catch (IOException e) {
            throw new IOException("Error executing python script", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted while waiting for Python script", e);
        }
    }
}